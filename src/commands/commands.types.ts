import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordClient } from "../classes/discordClient";
export abstract class abstractCommand {
    abstract data: SlashCommandBuilder;
    abstract execute: (
        client: DiscordClient,
        interaction: CommandInteraction,
    ) => void;
}
