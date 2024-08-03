import { CommandInteraction, ClientEvents } from "discord.js";
import { DiscordClient } from "../classes/discordClient";
export abstract class abstractEvent {
    abstract name: ClientEvents;
    abstract once?: boolean; 
    abstract execute: (client: DiscordClient,...args: any) => void;
}

export abstract class abstractDynamicRegisteredEvent extends abstractEvent {
    abstract guid: string;
    abstract initialization: Date;
    abstract expiry: Date;
}