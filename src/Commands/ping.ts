import { Command } from "../Interfaces";

export const command: Command = {
    name: 'ping', 
    description: 'ping command',
    aliases: ['p'],
    execute: async (message) => {
        message.channel.send('Pong');
    }
}