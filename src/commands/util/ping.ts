import { EmbedBuilder, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordClient } from "../../classes/discordClient";
import { abstractCommand } from "../commands.types";

export default abstract class Ping extends abstractCommand {
    static data: SlashCommandBuilder =  new SlashCommandBuilder().setName("ping").setDescription("Round trip travel between Void and the Discord API");
    static execute(interaction: CommandInteraction, client: DiscordClient) {
        const Response = new EmbedBuilder().setColor("Orange").setDescription(`🏓${client.ws.ping}ms`);
        interaction.reply({ embeds: [Response] });
    }
};