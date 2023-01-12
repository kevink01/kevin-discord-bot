import { Command, Event } from "../Interfaces";
import { Message, PermissionsString } from 'discord.js';
import { EventType } from "../Utility";
import { bulkDelete } from "../Utility/functions";

export const event: Event = {
    name: 'messageCreate',
    type: EventType.on,
    execute: async (client, message: Message) => {
        if (message.author.bot || !message.guild || !message.content.startsWith(client.config.prefix)) {
            return;
        };
        console.log(message);
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLocaleLowerCase();
        if (!cmd) return;
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        if (!command) {
            bulkDelete(message, 'Unknown command', 2000).then(() => {return});
        }
        if (command.permissions) {
            for (let perm of command.permissions) {
                if (!message.member.permissions.has(perm)) {
                    bulkDelete(message, `User missing permission: ${perm}`, 2000).then(() => {return});
                }
            }
        }
        if (args.length < command.minArgs || (command.maxArgs !== null && args.length > command.maxArgs)) {
            bulkDelete(message, `Please use this usage: ${command.usage}`, 2000).then(() => {return});
        }
        (command as Command).execute(message, client, args);
    }
}