const { client, Discord } = require('../index');
const mongoose = require('mongoose');

module.exports = {
    name: 'ready',
    once: true,
    invites: new Discord.Collection(),
    async execute() {
        await mongoose.connect(process.env.URI, {
            keepAlive: true
        }).then(
            console.log('   << Connection to mongodb successful!')
        );
        
        client.guilds.cache.forEach(guild => {
            let inviteList = new Discord.Collection();
            guild.invites.fetch().then(async (invite) => {
                invite.forEach(inv => {
                    inviteList.set(inv.code, inv.uses);
                })
                if (guild.vanityURLCode !== null) {
                    await guild.fetchVanityData().then(link => inviteList.set(guild.vanityURLCode, link.uses));
                }
                this.invites.set(guild.id, inviteList);
            })
        });
        console.log('   << The bot is online!');
        console.log('<< Login successful!');
        client.user.setActivity('Green Day', {type: 'LISTENING'});
    }
}