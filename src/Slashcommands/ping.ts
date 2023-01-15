import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from '../Interfaces';

export const slashcommand: SlashCommand = {
    name: 'ping',
    data: new SlashCommandBuilder().setName('ping').setDescription('replies with pong'),
    execute: (interaction) => {
        interaction.reply('Pong');
    }
}