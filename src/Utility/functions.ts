import { Message, TextChannel } from "discord.js";
import { Direction } from ".";

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

export async function delay(ms: number): Promise<void> {
    return new Promise (res => setTimeout(res, ms));
}

export async function bulkDelete(message: Message, content: string, wait: number): Promise<void> {
    await message.reply(content).then(async (m: Message) => {
        await delay(wait);
        m.delete();
    }).catch((err) => { console.error(err); });
    message.delete().catch((err) => { console.error(err); });
    return;
}