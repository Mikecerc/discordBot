import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordClient } from "../classes/discordClient";
export abstract class abstractCommand {
    abstract data: SlashCommandBuilder;
    abstract execute: (interaction: CommandInteraction, client: DiscordClient) => void;
}