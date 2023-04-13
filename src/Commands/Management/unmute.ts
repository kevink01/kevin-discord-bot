import { GuildMember, Message } from 'discord.js';
import { Command } from '../../Interfaces';
import { delay, findMember, resultPrint } from '../../Utility';

export const command: Command = {
	name: 'unmute',
	description: 'Unmutes a user',
	minArgs: 1,
	args: [
		{ argument: 'user', required: true },
		{ argument: 'reason', required: false }
	],
	permissions: ['MuteMembers'],
	aliases: ['um'],
	examples: [
		{ command: 'unmute @user', description: 'Mutes user with mention' },
		{ command: 'unmute userID', description: 'Mutes user with user id' },
		{
			command: 'unmute userID he apologized',
			description: "Mutes user  with reason 'he apologized'"
		}
	],
	execute: async (message, client, args) => {
		let reason = args.slice(1).join(' ') ?? 'Not specified';
		const user: GuildMember = await findMember(message, args[0]);
		if (!user) {
			resultPrint(message, "Couldn't find user", 2000);
			return;
		}
		if (!user.moderatable) {
			resultPrint(message, `Unable to unmute member ${user.user.username}`, 2000);
			return;
		}
		if (!user.communicationDisabledUntilTimestamp) {
			resultPrint(message, 'User is not muted', 2000);
			return;
		}
		user
			.disableCommunicationUntil(null, reason)
			.then(async (user: GuildMember) => {
				await message.channel
					.send(`Unmuted ${user.user.username}`)
					.then(async (m: Message) => {
						await delay(2000);
						m.delete();
					})
					.catch(console.error);
				message.delete().catch(console.error);
			})
			.catch((err) => {
				console.error(err);
				resultPrint(message, `Unable to unmute user ${user.user.username}`, 2000);
				return;
			});
	}
};
