# bulbremote

A Tasmota-based remote control for the [Kauf BLF10](https://kaufha.com/blf10/)
smart bulb. May work with other bulbs, but likely not.

## Running

First, build the frontend:

```sh
npm run build
```

This builds them into `dist`. Move/copy the contents to any file server.

Then, configure the backend. The backend is implemented trivially, so you can do
all of it using just Caddy. See the [Caddyfile](./Caddyfile) for an example.
