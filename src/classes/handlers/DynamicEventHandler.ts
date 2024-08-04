/*
 * Copyright (c) 2024, Michael Cercone
 * All rights reserved.
 */

import { dynamicEventTypes, IDynamicallyRegisteredEvent } from "../../events/events.types";
import DatabaseParodyCollection from "../databaseParodyCollection";
import { v7 as uuidv7 } from "uuid";
import { DiscordClient } from "../discordClient";
import { Interaction } from "discord.js";

/* The purpose of this handler is to assist in and manage the creation of dynamically loaded event. 
* These events are designed to by dynamically loaded and registered and are intended to be used when tying callbacks to interactables generated by commands. 
* For example, if a command generates a message containing a button, the event handler would be used to manage the callback of the button. 
* When a user registers a dynamic event, a guid and a time stamp are generated and stored along side the event. These events are then stored in a databaseParodyCollection.
* This functionality allows for the dynamic events to survive a restart of the bot while being locally cached for faster access. 
* Upon a recieved interaction that matches the guid (the custom id attached to the discord interaction), the event handler will check the databaseParodyCollection for the event and execute the callback.
* This class will deal with the creaation, registration, and execution of these dynamic events. 
*/

/**
* @class DynamicEventHandler
* @description This class is designed to manage the creation, registration, and execution of dynamically loaded events.
* @property {DatabaseParodyCollection<string, IDynamicallyRegisteredEvent>} events - A databaseParodyCollection that stores the dynamically loaded events.
* @method {registerEvent} - Registers a dynamic event with a callback and an optional expiry time.
* @method {unregisterEvent} - Unregisters a dynamic event.
* @method {executeEvents} - Executes the dynamic events.
* @method {deleteExpiredEvents} - Deletes expired events.
* @method {generateGUID} - Generates a GUID.
*/
export default class DynamicEventHandler {
    //events
    private events: DatabaseParodyCollection<string, IDynamicallyRegisteredEvent>
    constructor() {
        this.events = new DatabaseParodyCollection<string, IDynamicallyRegisteredEvent>("dynamicEvents");
        this.events.init();
    }

    /**
     * @description Registers a dynamic event with a callback and an optional expiry time.
     * @param event
     * @param callback 
     * @param expiryTime 
     */
    public async registerEvent(event: dynamicEventTypes, callback: Function, expiryTime?: Date): Promise<void> {
        const guid = await this.generateGUID();
        event.setCustomId(guid);
        const initTimeStamp = new Date();
        //default time is 7 days
        const expiryTimeStamp = expiryTime ? expiryTime : new Date(initTimeStamp.getTime() + 7 * 24 * 60 * 60 * 1000);
        const eventObject: IDynamicallyRegisteredEvent = {
            guid: guid,
            initialization: initTimeStamp,
            expiry: expiryTimeStamp,
            data: event,
            event: {
                name: "interactionCreate",
                once: false,
                execute: (...args) => callback(...args)
            }
        }
        this.events.set(guid, eventObject);
        this.events.save();
    }

    /**
     * @description Unregisters a dynamic event.
     * @param guid 
     */
    private async unregisterEvent(guid: string): Promise<void> {
        this.events.delete(guid);
        this.events.save();
    }

    /**
     * @description Executes the dynamic events.
     * @param client
     * @returns void
    */
    public async executeEvents(client: DiscordClient): Promise<void> {
        client.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
                const event = this.events.get(interaction.customId);
                if (event) {
                    try {
                        event.event.execute(client, interaction);
                        this.unregisterEvent(interaction.customId);
                    } catch (error) {
                        console.error(error);
                    }
                };
            };
        });
    }

    /**
     * @description Deletes expired events.
     */
    public async deleteExpiredEvents() {
        const expiredEvents = this.events.filter((event) => event.expiry < new Date());
        expiredEvents.forEach((event) => {
            this.events.delete(event.guid);
        });
        this.events.save();
    }

    /**
     * @description Generates a GUID.
     * @returns string
     */
    private generateGUID(): string {
        return uuidv7();
    }

}