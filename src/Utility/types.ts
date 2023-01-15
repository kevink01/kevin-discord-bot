export enum Direction {
    left = 0,
    right = 1
}

export enum EventType {
    on = 0,
    once = 1
}

export interface Example {
    command: string;
    description: string;
}

export interface Args {
    argument: string;
    required: boolean;
}