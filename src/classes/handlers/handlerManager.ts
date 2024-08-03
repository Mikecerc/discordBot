import { DiscordClient } from "../discordClient";
import CommandHandler from "./commands";
import EventHandler from "./events";
export default class HandlerManager {
    public static async loadHandlers(client: any) {
        //lazy load all command handlers and run them
        
    }
    private static async loadCommandHandler(client: DiscordClient) {
        const commandHandler = new CommandHandler();
        await commandHandler.initializeCommands(client);
    }
}