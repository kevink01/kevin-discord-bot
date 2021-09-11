const { invites } = require('./ready')
const { Discord } = require('../index');

module.exports = {
    name: 'guildMemberAdd',
    on: true,
    async execute(member) {
        const channel = member.guild.channels.cache.find(ch => ch.id === '776940464837623852');
        const guildInvites = invites.get(member.guild.id);
        var inv = undefined;
        await member.guild.invites.fetch().then(list => {
            list.forEach(code => {
                if (code.uses > guildInvites.get(code.code)) {
                    inv = code;
                    guildInvites.set(code.code, code.uses);
                }
            })
        })
        let memberJoin = new Discord.MessageEmbed()
            .setAuthor(`${member.user.username}`, member.user.displayAvatarURL())
            .setDescription(`**Member #${member.guild.memberCount}**`)
            .setColor('YELLOW')
            .setTimestamp();
        

        if (inv) {
            memberJoin.addFields(
                { name: 'Created Account', value: `${new Date(member.user.createdTimestamp).toLocaleDateString()}`},
                { name: 'Invited by', value: `${inv.inviter}`, inline: true },
                { name: 'Invite count', value: `${inv.uses}`, inline: true },
                { name: 'Invite URL', value: `https://disocrd.gg/${inv.code}` }
            )
        }
        else {
            let vanity;
            await member.guild.fetchVanityData().then(link => vanity = link.uses);
            if (vanity > guildInvites.get(member.guild.vanityURLCode)) {
                memberJoin.addFields(
                    { name: 'Created Account', value: `${new Date(member.createdTimestamp).toLocaleTimeString()}`},
                    { name: 'Invited by', value: 'Vanity URL', inline: true },
                    { name: 'Invite count', value: vanity, inline: true },
                    { name: 'Invite URL', value: `https://discord.gg/${member.guild.vanityURLCode}` }
                )
                guildInvites.set(member.guild.vanityURLCode, vanity);
            }
            else {
                memberJoin.addFields(
                    { name: 'Created Account', value: `${new Date(member.user.createdTimestamp).toLocaleDateString()}`},
                    { name: 'Invited by', value: 'Unknown', inline: true },
                    { name: 'Invite count', value: 'Unknown', inline: true },
                    { name: 'Invite URL', value: 'Unknown'}
                )
            }
        }
        channel.send({ embeds: [memberJoin] });
    }
}