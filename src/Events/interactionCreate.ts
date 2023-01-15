import { ChatInputCommandInteraction, EmbedBuilder, Interaction, Message } from "discord.js"
import { Event, SlashCommand } from "../Interfaces"
import { EventType, delay } from "../Utility"

export const event: Event = {
    name: 'interactionCreate',
    type: EventType.on,
    execute: async (client, interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            const slashCommand: SlashCommand = client.slashCommands.get(interaction.commandName);
            if (!slashCommand) {
                await interaction.reply({ content: 'Couldn\'t find command', fetchReply: true }).then(async (message: Message) => {
                    await delay(2000);
                    message.delete();
                });
                interaction.deleteReply();
                return;
            }
            slashCommand.execute(interaction as ChatInputCommandInteraction, client);
            return;
        }
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
                        .setColor('Random');
                    if (command.permissions) {
                        let permStr: string = '';
                        for (let i = 0; i < command.permissions.length; i++) {
                            permStr += command.permissions[i] + '\n'
                        }
                        if (permStr.length) {
                            embed.addFields({name: 'Required Permissions', value: permStr});
                        }
                    }
                    if (command.minArgs) {
                        embed.addFields({name: 'Minimum args', value: command.minArgs.toString(), inline: true});
                    }
                    if (command.maxArgs) {
                        embed.addFields({name: 'Minimum args', value: command.maxArgs.toString(), inline: true});
                    }
                    if (command.args) {
                        let argsStr: string = '';
                        for (const args of command.args) {
                            argsStr += args.required ? '<' : '[';
                            argsStr += args.argument;
                            argsStr += args.required ? '> ' : '] ';
                        }
                        if (argsStr.length) {
                            embed.addFields({name: 'Args', value: argsStr.trim()});
                        }
                    }
                    if (command.examples) {
                        let examplesStr = '';
                        for (let i = 0; i < command.examples.length; i++) {
                            examplesStr += '**' + client.config.prefix + command.examples[i].command + '**: ' + command.examples[i].description + '\n';
                        }
                        if (examplesStr.length) {
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