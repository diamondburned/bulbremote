import * as vite from "vite";
import * as http from "http";
import * as process from "process";

// This file serves as an example of the /config.json endpoint. Another example
// can be found in the Caddyfile file in the root of this repository.

const handlers: Record<string, vite.Connect.NextHandleFunction> = {
  "/api/config": (req, resp, next) => {
    resp.setHeader("Content-Type", "application/json");
    resp.end(
      JSON.stringify({
        JSONBIN_ID: process.env.APP_JSONBIN_ID,
        JSONBIN_TOKEN: process.env.APP_JSONBIN_TOKEN,
      })
    );
  },
  "/api/apply": (req, resp, next) => {
    const url = new URL(req.url ?? "/", process.env.APP_TASMOTA_ENDPOINT);
    fetch(url.toString());
    resp.end();
  },
};

export const apiServer = () => ({
  name: "api-server",
  configureServer(server: vite.ViteDevServer) {
    Object.entries(handlers).forEach(([path, handler]) => {
      console.log(`Registering handler for ${path}`);
      server.middlewares.use(path, handler);
    });
  },
});
