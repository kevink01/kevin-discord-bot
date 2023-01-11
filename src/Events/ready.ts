import { Event } from "../Interfaces";
import { config } from "../config";

export const event: Event = {
    name: 'ready',
    once: false,
    execute: (client) => {
        console.log(`Client logged in as ${client.user.username}`);
    }
}