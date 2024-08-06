import {
    Interaction,
    ButtonBuilder,
    ChannelSelectMenuBuilder,
    ClientEvents,
    MentionableSelectMenuBuilder,
    ModalBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
} from "discord.js";
import { DiscordClient } from "../classes/discordClient";
export interface IEvent {
    name: string;
    once?: boolean;
    execute: (client: DiscordClient, ...args: any) => void;
}
export abstract class abstractStaticEvent implements IEvent {
    abstract name: string;
    abstract once: boolean;
    abstract execute(client: DiscordClient, ...args: any): void;
}

export interface IDynamicallyRegisteredEvent {
    guid: string;
    initialization: Date;
    expiry: Date;
    data: any;
    eventData: any;
    event: IEvent;
}

export type dynamicEventTypes =
    | ModalBuilder
    | ButtonBuilder
    | StringSelectMenuBuilder
    | UserSelectMenuBuilder
    | RoleSelectMenuBuilder
    | MentionableSelectMenuBuilder
    | ChannelSelectMenuBuilder;
