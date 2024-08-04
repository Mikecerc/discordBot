import env from "dotenv";
import { DiscordClient } from "./classes/discordClient";
//setup dotenv
env.config();
//initiate discordjs client
const client = new DiscordClient();
export default client;
//loging client
client.login(process.env.token);
