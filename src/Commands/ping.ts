import { Command } from '../Interfaces';

export const command: Command = {
	name: 'ping',
	description: 'ping command',
	permissions: ['Administrator', 'DeafenMembers'],
	aliases: ['p'],
	minArgs: 0,
	maxArgs: 2,
	args: [
		{ argument: 'user', required: true },
		{ argument: 'time', required: false }
	],
	examples: [
		{ command: 'ping', description: "Replies with 'Pong'" },
		{ command: 'ping hehe', description: "Replies with 'Pong'" }
	],
	execute: async (message) => {
		message.channel.send('Pong');
	}
};
