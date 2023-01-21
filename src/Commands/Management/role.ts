import { Collection, ColorResolvable, GuildMember, Role } from 'discord.js';
import { Command } from '../../Interfaces';
import { delay, findMember, resultPrint } from '../../Utility';

export const command: Command = {
	name: 'role',
	description: 'Manages roles for the server and guild users',
	minArgs: 2,
	args: [
		{ argument: 'choice', required: true },
		{ argument: 'role name/id', required: true },
		{ argument: 'user username/id', required: false }
	],
	permissions: ['ManageRoles', 'ModerateMembers'],
	aliases: ['r'],
	examples: [
		{
			command: 'role create user',
			description: 'creates role with name "user"'
		},
		{
			command: 'role delete 12345',
			description: 'deletes role with id "12345"'
		},
		{
			command: 'role add @User1 @Member',
			description: 'gives user @User1 the role "Member" '
		},
		{
			command: 'role remove userID roleID',
			description: 'removes role with id "roleID" from user with id "userID"'
		}
	],
	execute: async (message, client, args) => {
		switch (args[0]) {
			case 'create':
				{
					if (!args[2].startsWith('#') && (!args[2].startsWith('[') || !args[2].endsWith(']'))) {
						resultPrint(message, 'Color must be in the format #FFFFFF or [r,g,b] (no spaces)', 3000);
						return;
					}
					let color: ColorResolvable;
					if (args[2].startsWith('#')) {
						color = `#${args[2].substring(1)}`;
					} else {
						console.log(args[2].substring(1, args[2].length - 1).split(','));

						color = `#${args[2]
							.substring(1, args[2].length - 1)
							.split(',')
							.map((v: String) => {
								const hex: string = Number(v).toString(16); // Converts to hex
								return hex.length === 1 ? '0' + hex : hex;
							})
							.join('')}`;
					}
					message.guild.roles
						.create({ name: args[1], color: color })
						.then((r: Role) => {
							resultPrint(message, `Created role <@&${r.id}>`, 2000);
						})
						.catch((err) => {
							console.error(err);
							resultPrint(message, 'Unable to create role', 2000);
						});
				}
				break;
			case 'delete':
				{
					const roleDelete: Role = message.guild.roles.cache.find((r: Role) => r.id === args[1]);
					if (!roleDelete) {
						resultPrint(message, `Unable to find role with id "${args[1]}"`, 2000);
						return;
					}
					message.guild.roles
						.delete(roleDelete, args.slice(2).join(' '))
						.then(() => {
							resultPrint(message, `Deleted role`, 2000);
						})
						.catch((err) => {
							console.error(err);
							resultPrint(message, 'Unable to delete role', 2000);
						});
				}
				break;
			case 'add':
				{
					const user: GuildMember = await findMember(message, args[1]);
					if (!user) {
						resultPrint(message, "Couldn't find user", 2000);
						return;
					}
					const roleAdd: Role = message.guild.roles.cache.find((r: Role) => r.id === args[2]);
					if (!roleAdd) {
						resultPrint(message, `Unable to find role with id "${args[2]}"`, 2000);
						return;
					}
					user.roles
						.add(roleAdd)
						.then((member: GuildMember) => {
							resultPrint(message, `Added role ${roleAdd.name} to ${member.user.username}`, 2000);
						})
						.catch((err) => {
							console.error(err);
							resultPrint(message, `Unable to add role to ${user.user.username}`, 2000);
						});
				}
				break;
			case 'remove': {
				const user: GuildMember = await findMember(message, args[1]);
				if (!user) {
					resultPrint(message, "Couldn't find user", 2000);
					return;
				}
				const roleRemove: Role = message.guild.roles.cache.find((r: Role) => r.id === args[2]);
				if (!roleRemove) {
					resultPrint(message, `Unable to find role with id "${args[2]}"`, 2000);
					return;
				}
				user.roles
					.remove(roleRemove)
					.then((member: GuildMember) => {
						resultPrint(message, `Remove role ${roleRemove.name} to ${member.user.username}`, 2000);
					})
					.catch((err) => {
						console.error(err);
						resultPrint(message, `Unable to remove role to ${user.user.username}`, 2000);
					});
				break;
			}

			default:
				resultPrint(message, 'Unknown choice. Please check info in help command', 3000);
				break;
		}
	}
};
