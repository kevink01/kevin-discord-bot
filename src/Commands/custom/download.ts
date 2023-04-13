import { Guild, GuildEmoji } from 'discord.js';
import { Command } from '../../Interfaces';
import fs from 'fs';
import path from 'path';
import { emotePath, servers } from '../../Utility';

export const command: Command = {
	name: 'download',
	description: 'Gets a list of emojis',
	permissions: ['ManageEmojisAndStickers'],
	examples: [],
	execute: async (_message, client) => {
		try {
			servers.forEach((server: string) => {
				fs.readdir(path.join(emotePath, server), (err, folders) => {
					if (err) throw err;
					for (const folder of folders) {
						fs.readdir(path.join(emotePath, server, folder), (err, emotes) => {
							for (const emote of emotes) {
								fs.unlink(
									path.join(emotePath, server, folder, emote),
									(err) => {
										if (err) throw err;
									}
								);
							}
						});
					}
				});
			});

			client.guilds.cache.forEach((guild: Guild) => {
				guild.emojis.cache.forEach(async (emoji: GuildEmoji) => {
					(await (await fetch(emoji.url)).blob())
						.arrayBuffer()
						.then(async (buffer: ArrayBuffer) => {
							const emote = Buffer.from(buffer);
							await fs.promises.writeFile(
								path.join(
									emotePath,
									guild.name,
									emoji.animated ? 'GIF' : 'PNG',
									emoji.name + (emoji.animated ? '.gif' : '.png')
								),
								emote
							);
						});
				});
			});
		} catch (error) {
			console.log(error);
		}
	},
};
