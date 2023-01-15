import { GuildMember, Message } from "discord.js";
import { Command } from "../../Interfaces";
import { delay, resultPrint } from "../../Utility";

export const command: Command = {
    name: 'mute',
    description: 'Mutes a user',
    minArgs: 2,
    args: [
        { argument: 'user', required: true },
        { argument: 'duration', required: true },
        { argument: 'reason', required: false } 
    ],
    permissions: ['MuteMembers'],
    aliases: ['m'],
    examples: [
        { command: 'mute @user 15m', description: 'Mutes user for 15 minutes with mention' },
        { command: 'mute userID 1h', description: 'Mutes user for 1 hour with user id' },
        { command: 'mute userID 4h he was bad', description: 'Mutes user for 4 hours with reason \'he was bad\'' }
    ],
    execute: async (message, client, args) => {
        let reason = args.slice(1).join(' ') ?? 'Not specified';
        const user: GuildMember = message.mentions.members.first() || await message.guild.members.cache.find((m) => m.id === args[0]);
        if (!user) {
            resultPrint(message, 'Couldn\'t find user', 2000);
            return;
        }
        if (!user.moderatable) {
            resultPrint(message, `Unable to mute member ${user.user.username}`, 2000);
            return;
        }
        if (user.communicationDisabledUntilTimestamp > Date.now()) {
            resultPrint(message, `User is already muted until ${user.communicationDisabledUntil}`, 2000);
            return;
        }
        const time = parseInt(args[1].replace(/\s+/g,""));
        if (time <= 0) {
            resultPrint(message, 'Duration must be positive', 2000);
            return;
        }
        const timeInterval = args[1].replace(/[[0-9]/g, "");
        let duration = 1000 * 60;
        switch (timeInterval) {
            case 'm':
                if (time > (14 * 24 * 60)) {
                    resultPrint(message, 'Duration must be less than 14 days', 2000);
                    return;
                }
                duration *= time;
                break;
            case 'h':
                if (time > (14 * 24)) {
                    resultPrint(message, 'Duration must be less than 14 days', 2000);
                    return;
                }
                duration *= time * 60;
                break;
            case 'd':
                if (time > 14) {
                    resultPrint(message, 'Duration must be less than 14 days', 2000);
                    return;
                }
                duration *= time * 24 * 60; 
                break;
            default: 
                resultPrint(message, 'Unknown time format. Please only use \'m\', \'h\', or \'d\'', 2000);
                return;
        }
        const date: number = Date.now() + duration;
        user.disableCommunicationUntil(date, reason).then(async (user: GuildMember) => {
            await message.channel.send(`Muted ${user.user.username} until ${new Date(date)}`).then(async (m: Message) => {
                await delay(2000);
                m.delete();
            }).catch(console.error);
            message.delete().catch(console.error);
        }).catch((err) => {
            console.error(err);
            resultPrint(message, `Unable to mute user ${user.user.username}`, 2000);
            return;
        })
    }
}