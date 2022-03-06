const { Discord } = require('../../index');
module.exports = {
    name: 'emote',
    args: `<choice> <emoji> [emoji_name]`,
    minArgs: 2,
    maxArgs: 3,
    permissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    description: 'A utility command to add and remove emojis and stickers to the guild, as well change the name of the emoji/sticker',
    examples: [
        '+emote add :ExampleEmote: -> Adds :ExampleEmote: to the guild',
        '+emote add :ExampleEmote: newName -> Adds :newName: to the guild',
        '+emote remove :ExampleEmote: -> Remove :ExampleEmote: from the guild',
        '+emote rename :ExampleEmote: newName -> Changes the name of :ExampleEmote: to :newName:'
    ],
    execute(message, args) {
        let choice = args[0].toLowerCase();
        let emoji = Discord.Util.parseEmoji(args[1]);
        if (emoji.id) {
            switch (choice) {
                case 'add':
                    const extension = emoji.animated ? '.gif' : '.png';
                    if (args.length === 3) {
                        emoji.name = args[2];
                    }
                    const url = `https://cdn.discordapp.com/emojis/${emoji.id + extension}`;
                    try {
                        message.guild.emojis.create(url, emoji.name)
                            .then(message.channel.send(`Successfully added <:${emoji.name}:${emoji.id}> to the server!`));
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'delete':
                    let delEmote = message.guild.emojis.cache.find(e => e.id === emoji.id);
                    if (delEmote) {
                        delEmote.delete()
                            .then(message.channel.send(`Successfully deleted <:${emoji.name}:${emoji.id}> from the server!`));
                    }
                    else {
                        message.channel.send(`Could not find that emote, please enter a valid emote.`);
                    }
                    break;
                case 'rename':
                    let renameEmote = message.guild.emojis.cache.find(e => e.id === emoji.id);
                    if (renameEmote) {
                        try {
                            message.guild.emojis.create(renameEmote.url, args[2])
                            .then(message.channel.send(`Successfully changed emote to name: :${args[2]}:`));
                            renameEmote.delete();
                        }
                        catch {
                            message.channel.send('Please enter a valid emote name');
                            return;
                        }
                    }
                    else {
                        message.channel.send(`Could not find that emote, please enter a valid emote.`);
                    }
                    break;
                default:
                    message.channel.send(`Unknown choice \`${choice}\`. The only choices are: **add, delete, rename**`);
                    break;
            }
        }
    }
}