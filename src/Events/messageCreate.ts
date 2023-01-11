import { Command, Event } from "../Interfaces";
import { Message } from 'discord.js';
import { EventType } from "../Utility";

export const event: Event = {
    name: 'messageCreate',
    type: EventType.once,
    execute: (client, message: Message) => {
        if (message.author.bot || !message.guild || !message.content.startsWith(client.config.prefix)) {
            return;
        };
        console.log(message);
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLocaleLowerCase();
        if (!cmd) return;
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        if (!command) {
            message.channel.send("Unknown command");
            return;
        }
        (command as Command).execute(message, client, args);
        
    }
}