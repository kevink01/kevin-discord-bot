const { invites } = require('./ready')
const { Discord } = require('../index');
const schema = require('../Mongoose/schema.js');

module.exports = {
    name: 'guildMemberAdd',
    on: true,
    async execute(member) {
        let welcomeChannel;
        let logChannel;
        await schema.server.findOne( { guild: member.guild.id }).then(result => {
            welcomeChannel = member.guild.channels.cache.find(c => c.id === result.welcome);
            logChannel = member.guild.channels.cache.find(c => c.id === result.logging);
        })

        if (!welcomeChannel) {
            console.log('Could not find the channel.');
            return;
        }
        /*const guildInvites = invites.get(member.guild.id);
        var inv = undefined;
        await member.guild.invites.fetch().then(list => {
            list.forEach(code => {
                if (code.uses > guildInvites.get(code.code)) {
                    inv = code;
                    guildInvites.set(code.code, code.uses);
                }
            })
        });*/
        let joined = await new Date();
        let memberJoin = new Discord.MessageEmbed()
            .setAuthor(`${member.user.username}`, member.user.displayAvatarURL())
            .addFields(
                { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
                { name: 'Joined Date: ', value: `${joined.toLocaleDateString()}`, inline: true },
                { name: 'Joined Time: ', value: `${joined.toLocaleTimeString()}`, inline: true }
            )
            .setColor('RANDOM')
            .setTimestamp();
            
        

        /*if (inv) {
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
                    { name: 'Created Account', value: `${new Date(member.user.createdTimestamp).toLocaleDateString()}`},
                    { name: 'Invited by', value: 'Vanity URL', inline: true },
                    { name: 'Invite count', value: `${vanity}`, inline: true },
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
        }*/
        welcomeChannel.send({ embeds: [memberJoin] });
    }
}