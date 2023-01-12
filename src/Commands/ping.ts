import { Command } from "../Interfaces";

export const command: Command = {
    name: 'ping', 
    description: 'ping command',
    permissions: ['Administrator'],
    aliases: ['p'],
    minArgs: 1,
    usage: '?ping',
    execute: async (message) => {
        message.channel.send('Pong');
    }
}