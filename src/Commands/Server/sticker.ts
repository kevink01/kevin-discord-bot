import { Attachment, GuildStickerCreateOptions, GuildStickerEditData, GuildStickerManager, Message, Sticker } from "discord.js";
import { Command } from "../../Interfaces";
import { resultPrint, delay } from "../../Utility";

export const command: Command = {
    name: 'sticker',
    description: 'Manage server stickers',
    minArgs: 2,
    maxArgs: 3,
    args: [
        { argument: 'choice', required: true },
        { argument: 'old_sticker_name', required: true },
        { argument: 'new_sticker_name | tag', required: false }
    ],
    permissions: ['ManageEmojisAndStickers'],
    aliases: ['stick', 'st'],
    examples: [
        { command: 'sticker add name', description: 'Adds sticker "name" to guild' },
        { command: 'sticker add name tag1 tag2', description: 'Adds sticker "name" to guild with tags' },
        { command: 'sticker delete name:', description: 'Removes sticker "name" from guild' },
        { command: 'sticker rename old_name new_name', description: 'Renames :example: to :ex:' },
    ],
    execute: async (message, client, args) => {
        switch(args[0].toLowerCase()) {
            case 'add':
                console.log(message.attachments.first());
                const attach: Attachment = message.attachments.first();
                if (!attach) {
                    resultPrint(message, 'Please provide a sticker attachment', 2000);
                    return;
                }
                if (!attach.contentType.startsWith('image')) {
                    resultPrint(message, 'Sticker must be png/gif', 2000);
                    return;
                }
                
                try {
                    message.guild.stickers.create({file: attach.url, name: args[1], tags: args[2] ? args[2] : ''} as GuildStickerCreateOptions).then(async () => {
                        await message.channel.send(`Successfully added sticker ${args[1]}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                        message.delete();
                    })
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            case 'delete':
            case 'del':
                let delSticker: Sticker = message.guild.stickers.cache.find((s) => s.name === args[1]);
                if (!delSticker) {
                    resultPrint(message, 'Couldn\'t find sticker. Try again.', 2000);
                    return;
                }
                try {
                    message.guild.stickers.delete(delSticker).then(async () => {
                        await message.channel.send(`Successfully deleted sticker ${args[1]}}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                        message.delete();
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            case 'rename':
                let renameSticker = message.guild.stickers.cache.find((s) => s.name === args[1]);
                if (!renameSticker) {
                    resultPrint(message, 'Couldn\'t find sticker. Try again.', 2000);
                    return;
                }
                try {
                    message.guild.stickers.edit(renameSticker, {name: args[2]}).then(async (newSticker: Sticker) => {
                        await message.channel.send(`New sticker name for sticker ${renameSticker.name}: ${newSticker.name}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                        message.delete();
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
                break;
            case 'tag':
                let tagSticker = message.guild.stickers.cache.find((s) => s.name === args[1]);
                if (!tagSticker) {
                    resultPrint(message, 'Couldn\'t find sticker. Try again.', 2000);
                    return;
                }
                try {
                    message.guild.stickers.edit(tagSticker, {tags: args[2]}).then(async (newSticker: Sticker) => {
                        await message.channel.send(`New sticker tag for sticker ${tagSticker.name}: ${newSticker.tags}`).then(async (m: Message) => {
                            await delay(2000);
                            m.delete();
                        });
                        message.delete();
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