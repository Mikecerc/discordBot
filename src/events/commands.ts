import { CommandInteraction, Interaction } from "discord.js";
import { DiscordClient } from "../classes/discordClient";
import { abstractStaticEvent } from "./events.types";

export default abstract class Commands extends abstractStaticEvent {
    static name = "interactionCreate";
    static once = false;
    static execute(client: DiscordClient, interaction: Interaction): any {
        if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Command ${interaction.commandName} not found`);
                try {
                    interaction.reply({
                        content: "Command not found",
                        ephemeral: true,
                    });
                    return;
                } catch(error) {
                    return console.error(error);
                }
            }
            try {
                command.execute(client, interaction as CommandInteraction);
            } catch (error) {
                console.error(error);
                interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    }
}