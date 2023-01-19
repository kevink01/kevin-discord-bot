import { Defaults } from "../Utility";

export interface Config {
  token: string;
  prefix: string;
  mongoURI?: string;
  defaults?: Defaults;
}
