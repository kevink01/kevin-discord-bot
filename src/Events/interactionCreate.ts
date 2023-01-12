import { EmbedBuilder, Interaction } from "discord.js"
import { Event } from "../Interfaces"
import { EventType } from "../Utility"
import { delay, findFile } from "../Utility/functions"
export const event: Event = {
    name: 'interactionCreate',
    type: EventType.on,
    execute: async (client, interaction: Interaction) => {
        if (interaction.isStringSelectMenu()) {
            switch(interaction.customId) {
                case 'Help Menu':
                    const command = client.commands.get(interaction.values[0]);
                    if (!command) {
                        interaction.reply('Something went wrong. Please try again').then(async (i) => {
                            await delay(2000);
                            i.interaction.channel.bulkDelete(2);
                            return;
                        })
                    }
                    const embed = new EmbedBuilder()
                        .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
                        .setTitle(`Title: ${command.name}`)
                        .setDescription(`Description: ${command.description}`)
                    if (command.permissions) {
                        let permStr: string = "";
                        for (let i = 0; i < command.permissions.length; i++) {
                            permStr += command.permissions[i] + '\n'
                        }
                        if (permStr.length > 0) {
                            embed.addFields({name: 'Required Permissions', value: permStr});
                        }
                    }
                    if (command.minArgs) {
                        embed.addFields({name: 'Minimum args', value: command.minArgs.toString(), inline: true});
                    }
                    if (command.maxArgs) {
                        embed.addFields({name: 'Minimum args', value: command.maxArgs.toString(), inline: true});
                    }
                    embed.addFields({name: 'Usage', value: command.usage});
                    if (command.examples) {
                        let examplesStr = '';
                        for (let i = 0; i < command.examples.length; i++) {
                            examplesStr += '**' + command.examples[i].command + '**: ' + command.examples[i].description + '\n';
                        }
                        if (examplesStr !== '') {
                            embed.addFields({name: 'Examples', value: examplesStr});
                        }
                    }
                    interaction.reply({ embeds: [embed] });
                    break;
                default: break;
            }
        }
    }
}