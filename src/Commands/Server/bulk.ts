import { Collection, Message, TextChannel } from "discord.js";
import { Command } from "../../Interfaces";
import { resultPrint, delay } from "../../Utility";

export const command: Command = {
    name: 'bulk',
    description: 'Deletes a certain number of messages',
    minArgs: 1,
    maxArgs: 1,
    args: [
        { argument: 'number', required: true}
    ],
    permissions: ['ManageMessages'],
    aliases: ['delete', 'del', 'purgeChat'],
    examples: [
        { command: 'bulk 10', description: 'Deletes last 10 messages'}
    ],
    execute: async (message, client, args) => {
        const messageCount: number = Number(args[0]);
        if (isNaN(messageCount)) {
            resultPrint(message, 'Not a number!', 2000);
            return;
        }
        if (messageCount <= 0 || messageCount >= 100) {
            resultPrint(message, 'Must be between 0 and 100.', 2000);
            return;
        }
        const textChannel: TextChannel = message.channel as TextChannel;
        await textChannel.messages.delete(message).then(async () => {
            await textChannel.bulkDelete(messageCount).then(async (collection: Collection<string, Message>) => {
                textChannel.send(`Deleted ${collection.size} messages`).then(async (m: Message) => {
                    await delay(2000);
                    m.delete();
                })
            });
        })
    }
}