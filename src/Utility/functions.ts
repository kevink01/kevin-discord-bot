import { Message } from "discord.js";
import path from "path";
import fs from "fs";
import { Direction } from ".";

export async function bulkDelete(message: Message, content: string, wait: number): Promise<void> {
    await message.reply(content).then(async (m: Message) => {
        await delay(wait);
        m.delete();
    }).catch((err) => { console.error(err); });
    message.delete().catch((err) => { console.error(err); });
    return;
}

export async function delay(ms: number): Promise<void> {
    return new Promise (res => setTimeout(res, ms));
}

export function printLoad(indents: number, direction: Direction, message: string): void {
    let print: string = "";
    for (let i = 0; i < indents; i++) {
        print += " ";
    }
    if (direction) {
        print += "<";
    } else {
        print += ">";
    }
    print += " " + message;
    console.log(print); 
}

export function findFile(cmd: string): string | undefined {
    return findFileHelper('../Commands', cmd)
}

function findFileHelper(dir: string, value: string) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    let temp: string | undefined = undefined;
    for (const f of files) {
        const stats = fs.lstatSync(path.join(__dirname, dir, f));
        if (stats.isDirectory()) {
            if ((temp = findFile(path.join(dir, f))) !== undefined) {
                return temp;
            }
        }
        else if (f.endsWith(`${value}.ts`)) {
            return path.join(dir, f);
        }
    }
    return undefined;
}