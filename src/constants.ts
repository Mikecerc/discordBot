import { ColorResolvable } from "discord.js";

export enum COLORS {
    Primary = "#1E90FF",
    Secondary = "#FF1493",
}
export interface IColors {
    Primary: ColorResolvable;
    Secondary: ColorResolvable;
}
