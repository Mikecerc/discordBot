import { readdirSync } from "fs";
import cron from "node-cron";
import { DiscordClient } from "../discordClient";
import { abstractTask } from "../../tasks/tasks.types";

export default class TaskHandler {
    private tasksArray: any[] = [];
    private taskFolders: string[];
    private taskFiles: string[];
    constructor() {
        //constructor
        this.taskFolders = [];
        this.taskFiles = [];
        const rootTaskFolder = readdirSync("./dist/tasks");
        rootTaskFolder.forEach((item) => {
            item.endsWith(".js")
                ? this.taskFiles.push(item)
                : this.taskFolders.push(item);
        });
        this.taskFolders.forEach((folder) => {
            const taskFiles = readdirSync(`./dist/tasks/${folder}`).filter(
                (files) => files.endsWith(".js") && !files.includes("types"),
            );
            taskFiles.forEach((file) => {
                this.taskFiles.push(file);
            });
        });
    }

    /**
     * @param client
     * @returns void
     * @description Lazy loads all task files
     */
    private async lazyLoadTasks(client: DiscordClient): Promise<void> {
        try {
            this.taskFiles.forEach(async (file: string) => {
                const task: abstractTask = await import(`../tasks/${file}`);
                client.tasks.set(task.name, task);
                this.tasksArray.push(task);
            });
        } catch (err) {
            throw new Error(err as string);
        }
    }

    /**
     * @param client
     * @returns void
     * @description Initializes all tasks
     */
    public async initializeTasks(client: DiscordClient): Promise<void> {
        await this.lazyLoadTasks(client);
        client.on("ready", async () => {
            try {
                this.tasksArray.forEach(async (task) => {
                    cron.schedule(task.cron, async () => {
                        try {
                            task.execute(client);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                });
            } catch (err) {
                throw new Error(err as string);
            }
        });
    }
}
