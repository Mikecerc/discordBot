import { readdirSync } from "fs";
import { SlashCommandBuilder } from "discord.js";
import { DiscordClient } from "../discordClient";
import { abstractCommand } from "../../commands/commands.types";

/**
 * CommandHandler class
 * @class CommandHandler
 * @description Handles the registration of all command files
 */
export default class CommandHandler {
    public commandsArray: SlashCommandBuilder[];
    private commandFolders: string[];
    private commandFiles: string[];
    constructor() {
        //constructor
        this.commandsArray = [];
        this.commandFolders = [];
        this.commandFiles = [];
        const rootCommandFolder = readdirSync("./dist/commands");
        rootCommandFolder.forEach((item) => {
            item.endsWith(".js") ? this.commandFiles.push(item) : this.commandFolders.push(item);
        })
        this.commandFolders.forEach((folder) => {
            const commandFiles = readdirSync(`./dist/commands/${folder}`).filter((files) => files.endsWith(".js") && !files.includes("types"));
            commandFiles.forEach((file) => {
                this.commandFiles.push(file);
            });
        });
    }

    /**
     * @param client 
     * @returns void
     * @description Lazy loads all command files
     */
    private async lazyLoadCommands(client: DiscordClient): Promise<void> {
        try {
            this.commandFiles.forEach(async (file: string) => {
                const command: abstractCommand = await import(`../commands/${file}`);
                client.commands.set(command.data.name, command);
                this.commandsArray.push(command.data);
            });
        } catch (err) {
            throw new Error(err as string);
        }
    }

    /**
     * @param client 
     * @returns void
     * @description Initializes all commands
     */
    public async initializeCommands(client: DiscordClient): Promise<void> {
        await this.lazyLoadCommands(client);
        client.on("ready", async () => {
            try {
                if (client.application == null) {
                    throw new Error("Client application is null");
                }
                const guilds = client.guilds.cache.map((res: any) => {
                    return res;
                });
                //test mode determines if the commands will be set globally or locally (by guild)
                if (process.env.testMode == "true") {
                    //for each guild, set the commands and remove all global commands
                    for (const guild in guilds) {
                        await guilds[guild].commands.set(this.commandsArray);
                    }
                    await client.application.commands.set([]);
                } else {
                    //set commands globally and remove all local commands in every guild
                    await client.application.commands.set(this.commandsArray);
                    for (const guild in guilds) {
                        await guilds[guild].commands.set([]);
                    }
                }
            } catch (err) {
                throw new Error(err as string);
            }
            
        });
    }
}