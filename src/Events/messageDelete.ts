import { EmbedBuilder, Message } from "discord.js";
import { Event } from "../Interfaces";
import { EventType } from "../Utility";

export const event: Event = {
    name: 'messageDelete',
    type: EventType.on,
    execute: async (client, message: Message) => {
        if (!message.guild.systemChannel) {
            return;   
        }
        if (message.content.startsWith(client.config.prefix)) {
            return;
        }
        if (message.author.username === client.user.username) {
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`Message from ${message.author.username} deleted`)
            .setAuthor({name: message.author.username, iconURL: message.author.displayAvatarURL()})
            .addFields(
                { name: 'Content', value: `${message.content}` }
            )
            .setTimestamp();    
        message.guild.systemChannel.send({ embeds: [embed]});
    }
}