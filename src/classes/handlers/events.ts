import { readdirSync } from "fs";
import { DiscordClient } from "../discordClient";
import { abstractEvent } from "../../events/events.types";

export default class EventHandler {
    public eventsArray: abstractEvent[];
    private eventFolders: string[];
    private eventFiles: string[];
    constructor() {
        //constructor
        this.eventsArray = [];
        this.eventFolders = [];
        this.eventFiles = [];
        const rooteventFolder = readdirSync("./dist/events");
        rooteventFolder.forEach((item) => {
            item.endsWith(".js") ? this.eventFiles.push(item) : this.eventFolders.push(item);
        })
        this.eventFolders.forEach((folder) => {
            const eventFiles = readdirSync(`./dist/events/${folder}`).filter((files) => files.endsWith(".js") && !files.includes("types"));
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
                const event: abstractEvent = await import(`../events/${file}`);
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
    public async initializeevents(client: DiscordClient): Promise<void> {
        await this.lazyLoadevents(client);
        //initialize all events
        this.eventsArray.forEach(async (event) => {
            if (event.once) {
                client.once(event.name as unknown as string, (...args: any) => {
                    try {
                        event.execute(client, ...args);
                    } catch (err) {
                        throw new Error(err as string);
                    }
                });
            } else {
                client.on(event.name as unknown as string, (...args: any) => {
                    try {
                        event.execute(client, ...args);
                    } catch (err) {
                        throw new Error(err as string);
                    }
                });
            }
        })
    }
}