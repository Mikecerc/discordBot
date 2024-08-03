import { DiscordClient } from "../classes/discordClient";
export abstract class abstractTask {
    abstract name: string;
    abstract data: string;
    abstract execute: (client: DiscordClient) => void;
}