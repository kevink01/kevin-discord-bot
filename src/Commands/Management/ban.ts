import { DMChannel, EmbedBuilder, GuildMember, Message, User } from "discord.js";
import { Command } from "../../Interfaces";
import { delay, resultPrint } from "../../Utility";

export const command: Command = {
    name: 'ban',
    description: 'Bans a user from this server',
    minArgs: 1,
    args: [
        { argument: 'user', required: true },
        { argument: 'reason', required: true }
    ],
    permissions: ['BanMembers'],
    aliases: ['boot', 'hammer'],
    examples: [
        { command: 'ban @user', description: 'Bans user via mention' },
        { command: 'ban userID', description: 'Bans user via ID' },
        { command: 'ban userID bad attitude', description: 'Bans user with reason \'nad attitude\''}
    ],
    execute: async (message, client, args) => {
        let reason = args.slice(1).join(' ') ?? 'Not specified';
        const user: GuildMember = message.mentions.members.first() || await message.guild.members.cache.find((m) => m.id === args[0]);
        if (!user) {
            message.guild.bans.create(args[0], {reason: reason}).then(async () => {
                await message.reply(`Successfully banned ${args[0]}`).then(async (m: Message) => {
                    await delay(2000);
                    m.delete();
                });
                message.delete();
                return;
            }).catch((err) => {
                console.error(err);
                resultPrint(message, `Couldn\'t ban user ${args[0]}`, 2000);
                return;
            });
            return;
        }
        if (!user.bannable) {
            resultPrint(message, `Unable to ban member ${user.user.username}`, 2000);
            return;
        }
        const embed = new EmbedBuilder()
        .setColor('DarkRed')
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTitle(`You were banned from ${message.guild.name}`)
        .addFields(
            { name: 'Reason:', value: `${reason}` }
        );

        user.createDM().then(async (channel: DMChannel) => {
            channel.send({embeds: [embed]}).catch((err) => {
                console.error(err);
                return;
            });
            user.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: reason }).then(async (member: GuildMember) => {
                await message.reply(`Successfully banned ${member.user.username}`).then(async (m: Message) => {
                    await delay(2000);
                    m.delete();
                });
                message.delete();
            });
        }).catch((err) => {
            console.error(err);
            user.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: reason }).then(async (member: GuildMember) => {
                await message.reply(`Successfully banned ${member.user.username}`).then(async (m: Message) => {
                    await delay(2000);
                    m.delete();
                });
                message.delete();
            });
            return;
        });
    }
}