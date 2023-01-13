import { StringSelectMenuBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { Command } from "../../Interfaces";

export const command: Command = {
    name: 'help', 
    description: 'help command',
    aliases: ['h'],
    execute: async (message, client) => {
        const menuItems = client.commands.map((cmd: Command) => {
            return {
                label: cmd.name,
                value: cmd.name,
                description: 'Click me for more info!'
            }
        });
        const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('Help Menu')
                .setPlaceholder('Select a command')
                .setMaxValues(1)
                .addOptions(menuItems)
            );
        message.channel.send({ content: 'Please select a command for more information', components: [selectMenu]})
    }
}