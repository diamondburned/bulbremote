import * as jsonbin from "./jsonbin.js";
import * as tasmota from "./tasmota.js";

export type Config = {
  JSONBIN_ID: string;
  JSONBIN_TOKEN: string;
};

export async function config(): Promise<Config> {
  const resp = await fetch("/api/config");
  const json = await resp.json();

  if (json.JSONBIN_ID === undefined || json.JSONBIN_TOKEN === undefined) {
    throw new Error("invalid config");
  }

  return json;
}

export async function command(command: string): Promise<void> {
  const query = new URLSearchParams();
  query.set("cmnd", command);
  await fetch("/api/command?" + query.toString());
}
