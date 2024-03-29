import { Command, Event } from '../Interfaces';
import { Message } from 'discord.js';
import { EventType, resultPrint } from '../Utility';

export const event: Event = {
	name: 'messageCreate',
	type: EventType.on,
	execute: async (client, message: Message) => {
		if (message.author.bot || !message.guild || !message.content.startsWith(client.config.prefix)) {
			return;
		}
		const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
		const cmd = args.shift().toLocaleLowerCase();
		if (!cmd) return;
		const command = client.commands.get(cmd) || client.aliases.get(cmd);
		if (!command) {
			resultPrint(message, 'Unknown command', 2000);
			return;
		}
		if (command.permissions) {
			for (let perm of command.permissions) {
				if (!message.member.permissions.has(perm)) {
					resultPrint(message, `User missing permission: ${perm}`, 2000);
					return;
				}
			}
		}
		if (args.length < command.minArgs || (command.maxArgs !== null && args.length > command.maxArgs)) {
			resultPrint(
				message,
				`Please use this usage: ${client.config.prefix}${command.name} ${command.args
					.map((arg) => {
						return arg.argument;
					})
					.join(' ')}`,
				2000
			);
			return;
		}
		(command as Command).execute(message, client, args);
	}
};
