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
        const rootTaskFolder = readdirSync("./src/tasks");
        rootTaskFolder
            .filter((f) => !f.endsWith(".disabled") && !f.includes("types"))
            .forEach((item) => {
                item.endsWith(".ts")
                    ? this.taskFiles.push(item.slice(0, -3))
                    : this.taskFolders.push(item);
            });
        this.taskFolders.forEach((folder) => {
            const taskFiles = readdirSync(`./src/tasks/${folder}`).filter(
                (files) => files.endsWith(".ts") && !files.includes("types"),
            );
            taskFiles.forEach((file) => {
                //push the folder, and file paths but remove the .ts extension
                this.taskFiles.push((folder + "/" + file).slice(0, -3));
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
                const task: abstractTask = (await import(`../../tasks/${file}`))
                    .default;
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
