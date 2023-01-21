import Client from "../Client";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

interface Run {
  (interaction: ChatInputCommandInteraction, client?: Client, args?: string[]);
}

export interface SlashCommand {
  name: string;
  data: SlashCommandBuilder;
  execute: Run;
}
