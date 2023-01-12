import Client from '../Client';
import { Message, PermissionsString } from 'discord.js';

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
    minArgs?: number;
    maxArgs?: number;
    permissions?: PermissionsString[];
    aliases?: string[];
    usage: string;
    examples?: Example[];
    execute: Run;
}