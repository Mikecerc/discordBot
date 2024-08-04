import { DiscordClient } from "../discordClient";
import CommandHandler from "./CommandHandler";
import StaticEventHandler from "./StaticEventHandler";
import DynamicEventHandler from "./StaticEventHandler";
import TaskHandler from "./TaskHandler";

export default class HandlerManager {
    //load all handlers
    private commandHandler;
    private StaticEventHandler;
    public DynamicEventHandler;
    private TaskHandler;

    constructor(client: DiscordClient) {
        this.commandHandler = new CommandHandler();
        this.commandHandler.initializeCommands(client);

        this.StaticEventHandler = new StaticEventHandler();
        this.StaticEventHandler.initializeStaticEventFiles(client);

        this.DynamicEventHandler = new DynamicEventHandler();

        this.TaskHandler = new TaskHandler();
        this.TaskHandler.initializeTasks(client);
    }
}
