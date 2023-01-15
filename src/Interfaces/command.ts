import Client from '../Client';
import { Message, PermissionsString } from 'discord.js';
import { Args, Example } from '../Utility';

interface Run {
    (message: Message, client?: Client, args?: string[]);
}

export interface Command {
    name: string;
    description: string;
    minArgs?: number;
    maxArgs?: number;
    args?: Args[];
    permissions?: PermissionsString[];
    aliases?: string[];
    examples?: Example[];
    execute: Run;
}