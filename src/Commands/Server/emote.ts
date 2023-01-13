import { GuildEmoji, Message, parseEmoji } from "discord.js";
import { Command } from "../../Interfaces";
import { bulkDelete, delay } from "../../Utility";

export const command: Command = {
    name: 'emote',
    description: 'Manage server emojis',
    minArgs: 2,
    maxArgs: 3,
    args: [
        { argument: 'choice', required: true },
        { argument: 'emoji', required: true },
        { argument: 'emoji_name', required: false }
    ],
    permissions: ['ManageEmojisAndStickers'],
    aliases: ['emoji', 'em'],
    examples: [
        { command: '?emote add :example:', description: 'Adds :example" to guild' },
        { command: '?emote add :example: :ex:', description: 'Adds :ex: to guild' },
        { command: '?emote delete :example:', description: 'Removes :example: from guild' },
        { command: '?emote rename :example: ex', description: 'Renames :example: to :ex:' },
    ],
    execute: (message, client, args) => {
        const emoji = parseEmoji(args[1]);
        if (!emoji) {
            bulkDelete(message, 'Couldn\'t find emoji. Try again.', 2000);
            return;
        }
        switch(args[0].toLowerCase()) {
            case 'add':
                const extension: string = emoji.animated ? '.gif' : 'png';
                if (args.length === 3) {
                    emoji.name = args[2];
                }
                const url = `https://cdn.discordapp.com/emojis/${emoji.id}${extension}`;
                try {
                    message.guild.emojis.create({attachment: url, name: emoji.name}).then((newEmoji: GuildEmoji) => {
                        message.delete();
                        message.channel.send(`Successfully added ${newEmoji} to the server!`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            case 'delete':
            case 'del':
                let delEmote = message.guild.emojis.cache.find((e) => e.id === emoji.id);
                if (!delEmote) {
                    bulkDelete(message, 'Couldn\'t find emoji. Try again.', 2000);
                    return;
                }
                try {
                    message.guild.emojis.delete(delEmote).then(() => {
                        message.delete();
                        message.channel.send(`Successfully deleted ${emoji.name}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            case 'rename':
                let renameEmote = message.guild.emojis.cache.find((e) => e.id === emoji.id);
                if (!renameEmote) {
                    bulkDelete(message, 'Couldn\'t find emoji. Try again.', 2000);
                    return;
                }
                try {
                    message.guild.emojis.edit(renameEmote, {name: args[2]}).then(async (newEmoji: GuildEmoji) => {
                        message.delete();
                        message.channel.send(`New emoji name for emoji ${newEmoji}: ${newEmoji.name}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            default: break;
        }
    }
}