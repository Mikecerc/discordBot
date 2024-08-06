import { readdirSync } from "fs";
import { DiscordClient } from "../discordClient";
import { abstractStaticEvent, IEvent } from "../../events/events.types";

export default class StaticEventHandler {
    private eventFolders: string[];
    private eventFiles: string[];
    constructor() {
        //constructor
        this.eventFolders = [];
        this.eventFiles = [];
        const rooteventFolder = readdirSync("./src/events");
        rooteventFolder
            .filter((f) => !f.endsWith(".disabled") && !f.includes("types"))
            .forEach((item) => {
                console.log(item)
                item.endsWith(".ts")
                    ? this.eventFiles.push(item.slice(0, -3))
                    : this.eventFolders.push(item);
            });
        this.eventFolders.forEach((folder) => {
            const eventFiles = readdirSync(`./src/events/${folder}`).filter(
                (files) => files.endsWith(".ts") && !files.includes("types"),
            );
            eventFiles.forEach((file) => {
                this.eventFiles.push((folder + "/" + file).slice(0, -3));
            });
        });
    }

    /**
     * @param client
     * @returns void
     * @description Lazy loads all event files
     */
    private async lazyLoadevents(): Promise<IEvent[]> {
        try {
            let eventsArray: IEvent[] = [];
            await Promise.all(this.eventFiles.map(async (file: string) => {
                const event: abstractStaticEvent = (await import(`../../events/${file}`))
                    .default;
                eventsArray.push(event);
            }));
            return eventsArray;
        } catch (err) {
            throw new Error(err as string);
        }
    }

    /**
     * @param client
     * @returns void
     * @description Initializes all events
     */
    public async initializeStaticEventFiles(
        client: DiscordClient,
    ): Promise<void> {
        let events: IEvent[] = await this.lazyLoadevents();
        //initialize all events
        events.forEach(async (event) => {
            try {
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
            } catch {
                throw new Error("Error initializing events");
            }
        });
        console.log(`Loaded ${events.length} static events`);
    }
}
