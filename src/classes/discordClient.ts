import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import DatabaseParodyCollection from "./databaseParodyCollection";
import HandlerManager from "./handlers/HandlerManager";
import { COLORS, IColors } from "../constants";
export class DiscordClient extends Client {
    public commands: Collection<string, any>;
    public tasks: Collection<string, any>;
    public musicSubscriptions: Collection<string, any>;
    public reactionRoles: DatabaseParodyCollection<string, any>;
    public handlers: HandlerManager;
    public colors: IColors;
    constructor() {
        super({ intents: 32767 });
        this.checkEnv();
        this.commands = new Collection();
        this.tasks = new Collection();
        this.musicSubscriptions = new Collection();
        this.connectDb();
        this.reactionRoles = new DatabaseParodyCollection("ReactionRoles");
        this.handlers = new HandlerManager(this);
        this.colors = COLORS;

        this.on("ready", () => {
            console.log(`Logged in as ${this.user?.tag}`);
        });
    }
    public async reloadCommands() {
        this.handlers.reloadCommands();
    }
    public async reloadEvents() {
        //static event files only
        this.handlers.reloadEvents();
    }
    private async connectDb() {
        try {
            if (process.env.DEPLOYMENT == "PROD") {
                await mongoose.connect(
                    ((process.env.DB_URL as string) +
                        process.env.PROD_DB_NAME) as string,
                );
            } else if (process.env.DEPLOYMENT == "DEV") {
                await mongoose.connect(
                    ((process.env.DB_URL as string) +
                        process.env.DEV_DB_NAME) as string,
                );
            } else if (process.env.DEPLOYMENT == "TEST") {
                await mongoose.connect(
                    ((process.env.DB_URL as string) +
                        process.env.TEST_DB_NAME) as string,
                );
            } else {
                throw new Error("Invalid deployment environment provided");
            }

            console.log("connected to db");
        } catch (err) {
            throw new Error(
                ("Error connecting to mongoDb: \n" + err) as string,
            );
        }
    }
    private checkEnv() {
        if (!process.env.TOKEN) {
            throw new Error("No token provided");
        }
        if (!process.env.DEPLOYMENT) {
            throw new Error("No deployment environment provided");
        }
        if (
            process.env.DEPLOYMENT != "PROD" &&
            process.env.DEPLOYMENT != "DEV" &&
            process.env.DEPLOYMENT != "TEST"
        ) {
            throw new Error("Invalid deployment environment provided");
        }
        if (!process.env.DB_URL) {
            throw new Error("No db url provided");
        }
        if (!process.env.PROD_DB_NAME) {
            throw new Error("No prod db name provided");
        }
        if (!process.env.DEV_DB_NAME) {
            throw new Error("No dev db name provided");
        }
        if (!process.env.TEST_DB_NAME) {
            throw new Error("No test db name provided");
        }
    }
}
