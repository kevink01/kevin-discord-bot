import { Message } from 'discord.js';
import { Command } from '../../Interfaces';
import { delay, resultPrint } from '../../Utility';

export const command: Command = {
	name: 'unban',
	description: 'Unban a user by userID',
	minArgs: 1,
	args: [
		{ argument: 'userID', required: true },
		{ argument: 'reason', required: false }
	],
	permissions: ['BanMembers'],
	aliases: ['ub'],
	examples: [
		{ command: 'unban userID', description: 'Unbans user by ID' },
		{
			command: 'unban userID he improved',
			description: 'Unbans userID with reason'
		}
	],
	execute: async (message, client, args) => {
		let reason = args.slice(1).join(' ') ?? 'Not specified';
		message.guild.bans
			.remove(args[0], reason)
			.then(async () => {
				await message.reply(`Successfully unbanned ${args[0]}`).then(async (m: Message) => {
					await delay(2000);
					m.delete();
				});
				message.delete();
			})
			.catch((err) => {
				resultPrint(message, `Couldn\'t find user ${args[0]} to unban`, 2000);
				console.error(err);
				return;
			});
	}
};
