export type BinData<T extends Record<string, any>> = {
  metadata: Record<string, unknown>;
  record: T;
};

export class Bin<T extends Record<string, any>> {
  constructor(public readonly id: string, public readonly token: string) {}

  private async fetch(method: string, body?: any) {
    return fetch(`https://api.jsonbin.io/v3/b/${this.id}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      mode: "cors",
      headers: {
        ...{ "X-Access-Key": this.token },
        // Nix taught me well.
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
    });
  }

  async get(): Promise<BinData<T>> {
    const resp = await this.fetch("GET");
    const json: BinData<T> = await resp.json();
    json.metadata = json.metadata || {};
    json.record = json.record || {};
    return json;
  }

  async put(body: T) {
    await this.fetch("PUT", body);
  }
}
