import { Collection, GuildMember, Message } from 'discord.js';
import { Direction } from '.';

export async function delay(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}

export async function findMember(message: Message, id?: string): Promise<GuildMember> {
	let user: GuildMember = message.mentions.members.first();
	if (user) return user;
	await message.guild.members
		.fetch()
		.then((v: Collection<string, GuildMember>) => {
			user = v.find((m: GuildMember) => m.id === id);
		})
		.catch((err) => {
			console.error(err);
			return undefined;
		});
	console.log(user);
	return user;
}

export function printLoad(indents: number, direction: Direction, message: string): void {
	let print: string = '';
	for (let i = 0; i < indents; i++) {
		print += ' ';
	}
	if (direction) {
		print += '<';
	} else {
		print += '>';
	}
	print += ' ' + message;
	console.log(print);
}

export async function resultPrint(message: Message, content: string, wait: number): Promise<void> {
	await message
		.reply(content)
		.then(async (m: Message) => {
			await delay(wait);
			m.delete()
				.then(() => {
					message.delete().catch((err) => {
						console.error(err);
					});
				})
				.catch((err) => {
					console.error(err);
				});
		})
		.catch((err) => {
			console.error(err);
		});
	return;
}
