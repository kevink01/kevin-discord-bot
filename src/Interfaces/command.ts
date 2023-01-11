import Client from '../Client';
import { Message } from 'discord.js';

interface Run {
    (message: Message, client?: Client, args?: string[]);
}

interface Example {
    command: string;
    description: string;
}

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    examples?: Example[];
    execute: Run;
}