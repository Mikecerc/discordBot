import { Client, Collection } from 'discord.js';
import mongoose from 'mongoose';
import { readdirSync } from 'fs';
import DatabaseParodyCollection from './databaseParodyCollection';
export class DiscordClient extends Client {
    //this is temp. will change any to a proper interface
    public commands: Collection<string, any>;
    public musicSubscriptions: Collection<string, any>;
    public reactionRoles: DatabaseParodyCollection<string, any>;
    constructor() {
        super({ intents: 32767});
        this.commands = new Collection();
        this.musicSubscriptions = new Collection();
        this.reactionRoles = new DatabaseParodyCollection("ReactionRoles");
        this.connectDb();
        this.loadCommandHandlers();
    }
    public async reloadCommands() {
        
    } 
    public async reloadEvents() {

    }
    private async loadCommandHandlers() {
        //run each handler file
        readdirSync('./dist/handlers').forEach((handler) => {
        import(`./handlers/${handler}`).then((file) => file.default(this));
        });
    }
    private async connectDb() {
        try {
            mongoose.connect(process.env.db as string);
            console.log("connected to db");
        } catch (err) {
            console.error("error connecting to mongoDb", err);
        }
    }
}