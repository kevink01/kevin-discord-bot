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