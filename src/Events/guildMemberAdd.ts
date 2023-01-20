import { EmbedBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Event } from "../Interfaces";
import { EventType } from "../Utility";

export const event: Event = {
    name: 'guildMemberAdd',
    type: EventType.on,
    execute: async (client, member: GuildMember) =>  {
        if (!member.guild.systemChannel) {
            return;   
        }
        const joinedTimestamp = await new Date();
        const embed = new EmbedBuilder()
            .setAuthor({name: member.user.username, iconURL: member.user.displayAvatarURL()})
            .addFields(
                { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
                { name: 'Joined Date: ', value: `${joinedTimestamp.toLocaleDateString()}`, inline: true },
                { name: 'Joined Time: ', value: `${joinedTimestamp.toLocaleTimeString()}`, inline: true }
            )
            .setTimestamp();
            
        member.guild.systemChannel.send({ embeds: [embed]});
    }
}