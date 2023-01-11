import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'help', 
    description: 'help command',
    aliases: ['h'],
    execute: async (message) => {
        // message.channel.send('Pong');
    }
}