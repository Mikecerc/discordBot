import { readdirSync } from "fs";
import { DiscordClient } from "../discordClient";
import { abstractStaticEvent, IEvent } from "../../events/events.types";

export default class StaticEventHandler {
    public eventsArray: IEvent[];
    private eventFolders: string[];
    private eventFiles: string[];
    constructor() {
        //constructor
        this.eventsArray = [];
        this.eventFolders = [];
        this.eventFiles = [];
        const rooteventFolder = readdirSync("./dist/events");
        rooteventFolder.forEach((item) => {
            item.endsWith(".js")
                ? this.eventFiles.push(item)
                : this.eventFolders.push(item);
        });
        this.eventFolders.forEach((folder) => {
            const eventFiles = readdirSync(`./dist/events/${folder}`).filter(
                (files) => files.endsWith(".js") && !files.includes("types"),
            );
            eventFiles.forEach((file) => {
                this.eventFiles.push(file);
            });
        });
    }

    /**
     * @param client
     * @returns void
     * @description Lazy loads all event files
     */
    private async lazyLoadevents(client: DiscordClient): Promise<void> {
        try {
            this.eventFiles.forEach(async (file: string) => {
                const event: abstractStaticEvent = await import(`../events/${file}`);
                this.eventsArray.push(event);
            });
        } catch (err) {
            throw new Error(err as string);
        }
    }

    /**
     * @param client
     * @returns void
     * @description Initializes all events
     */
    public async initializeStaticEventFiles(client: DiscordClient): Promise<void> {
        await this.lazyLoadevents(client);
        //initialize all events
        this.eventsArray.forEach(async (event) => {
            if (event.once) {
                client.once(event.name, (...args: any) => {
                    try {
                        event.execute(client, ...args);
                    } catch (err) {
                        throw new Error(err as string);
                    }
                });
            } else {
                client.on(event.name, (...args: any) => {
                    try {
                        event.execute(client, ...args);
                    } catch (err) {
                        throw new Error(err as string);
                    }
                });
            }
        });
    }
}
