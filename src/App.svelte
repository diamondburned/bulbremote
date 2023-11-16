<script lang="ts">
  import "./style.scss";

  import type { State } from "#/lib/bulbstate.js";

  import {
    state,
    saveState as saveState_,
    restoreState,
  } from "#/lib/bulbstate.js";
  import { throttle } from "#/lib/throttle.js";
  import { onMount } from "svelte";

  import * as api from "#/lib/api.js";
  import * as jsonbin from "#/lib/jsonbin.js";
  import * as tasmota from "#/lib/tasmota.js";

  let loading: Promise<any>;
  let bin: jsonbin.Bin<State>;
  let saved = true;

  async function saveState() {
    if (!bin) {
      return;
    }

    await saveState_(bin);
    saved = true;
    console.debug("state saved");
  }

  const updateRate = 250; // ms per update
  const saveRate = 1000; // ms per save

  // Force state saving to run every 1 second max.
  const save = throttle(saveRate, () => saveState());

  // Subscribe to changes only after we've restored the state. Otherwise,
  // the light bulb will be turned on/off when the page is loaded.
  const apply = throttle(updateRate, () => {
    api.command(tasmota.commandApply($state));
  });

  onMount(() => {
    // Prevent the user from leaving the page if the state is unsaved.
    // We'll also asynchronously save the state to the server.
    let savePromise: Promise<void> | null = null;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saved) return;
      e.preventDefault();

      if (!savePromise) {
        savePromise = saveState();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });

  onMount(() => {
    // Enable light bulb fading. Keep duration the same as the throttle
    // duration.
    api.command(tasmota.commandFade());
  });

  onMount(async () => {
    loading = (async () => {
      const config = await api.config();
      bin = new jsonbin.Bin(config.JSONBIN_ID, config.JSONBIN_TOKEN);
      $state = await restoreState(bin);
    })();

    // Hook onto the state change and mark the state as unsaved.
    // We only do this after the state has been restored, otherwise
    // the light bulb will be turned on/off when the page is loaded.
    await loading;

    return state.subscribe(() => {
      saved = false;
      apply();
      save();
    });
  });
</script>

<main
  style="
    --w: {$state.w / 100};
    --h: {$state.h}deg;
    --s: {$state.s / 100};
    --v: {$state.v / 100};
	--bulb-v: {$state.on ? 1 : 0.2};
	--bulb-s: {$state.on ? 1 : 0.0};
  "
>
  {#await loading}
    <p aria-busy="true">Loading...</p>
  {:then}
    <a
      href={"#"}
      role="button"
      class="bulb-toggle"
      aria-label="Bulb Control (click to turn off)"
      on:click={() => {
        $state.on = !$state.on;
      }}>💡</a
    >
    <form>
      <label for="w">White Temperature</label>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={$state.w}
        on:change={save}
        id="w"
      />

      <label for="h">Hue</label>
      <input
        type="range"
        min="0"
        max="360"
        bind:value={$state.h}
        on:change={save}
        id="h"
      />

      <label for="s">Saturation</label>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={$state.s}
        on:change={save}
        id="s"
      />

      <label for="v">Brightness</label>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={$state.v}
        on:change={save}
        id="v"
      />
    </form>
  {/await}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 480px;
    height: 100vh;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  a.bulb-toggle {
    filter: saturate(var(--bulb-s)) brightness(var(--bulb-v));
    font-size: 4em;
    user-select: none;
    text-decoration: none;
  }

  a.bulb-toggle,
  a.bulb-toggle:focus {
    box-shadow: none;
    background: none;
    outline: none;
    border: none;
  }

  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 1em;
  }

  form label {
    text-align: left;
    margin-bottom: calc(var(--typography-spacing-vertical) / 1.5);
  }

  form input {
    margin-bottom: calc(var(--typography-spacing-vertical) * 1.5);
  }

  input[type="range"] {
    --bg: var(--color);
    --fg: var(--primary-focus);
    --girth: 20px;
    --thumb: transparent;
    --thumb-border: var(--primary);

    width: calc(100% - calc(var(--girth) / 2));
    background: transparent;
    cursor: grab;
    position: relative;
  }

  input[type="range"]:active {
    cursor: grabbing;
  }

  input[type="range"]::-moz-range-track,
  input[type="range"]::-moz-range-progress {
    width: calc(100% + (var(--girth) / 2));
    height: var(--girth);
    position: absolute;
    left: 0;
  }

  input[type="range"]::-moz-range-track {
    border-radius: 100px;
    background: var(--bg);
  }

  input[type="range"]::-moz-range-progress {
    border-radius: 100px 0 0 100px;
    background: transparent;
    width: 100%;
  }

  input[type="range"]::-moz-range-thumb {
    background: rgba(0, 0, 0, 0.1);
    height: calc(var(--girth) / 2);
    width: calc(var(--girth) / 2);
    outline: calc(var(--girth) / 3) solid var(--thumb-border);
    border: calc(var(--girth) / 6) solid var(--thumb);
    box-shadow: 0 0 12px 2px var(--background-color);
    transition-duration: 80ms;
  }

  #w {
    --bg: linear-gradient(
      to right,
      rgba(195, 244, 255, 1) 0% /* cold white */,
      rgba(255, 236, 147, 1) 100% /* warm white */
    );
    --thumb-border: var(--h1-color);
  }

  #h {
    /* https://stackoverflow.com/a/63302468/5041327 */
    --bg: linear-gradient(
      to right,
      rgba(255, 0, 0, 1) 0%,
      rgba(255, 154, 0, 1) 10%,
      rgba(208, 222, 33, 1) 20%,
      rgba(79, 220, 74, 1) 30%,
      rgba(63, 218, 216, 1) 40%,
      rgba(47, 201, 226, 1) 50%,
      rgba(28, 127, 238, 1) 60%,
      rgba(95, 21, 242, 1) 70%,
      rgba(186, 12, 248, 1) 80%,
      rgba(251, 7, 217, 1) 90%,
      rgba(255, 0, 0, 1) 100%
    );
    --fg: transparent;
    --thumb-border: white;
  }

  #s {
    --bg: linear-gradient(
      to right,
      hsl(var(--h), 100%, 95%) 0%,
      hsl(var(--h), 100%, 60%) 100%
    );
    --thumb-border: white;
  }

  #v {
    --bg: linear-gradient(
      to left,
      hsl(0, 0%, 100%) 0%,
      hsl(0, 0%, 99.36%) 8.1%,
      hsl(0, 0%, 97.54%) 15.5%,
      hsl(0, 0%, 94.66%) 22.5%,
      hsl(0, 0%, 90.81%) 29%,
      hsl(0, 0%, 86.07%) 35.3%,
      hsl(0, 0%, 80.5%) 41.2%,
      hsl(0, 0%, 74.16%) 47.1%,
      hsl(0, 0%, 67.09%) 52.9%,
      hsl(0, 0%, 59.33%) 58.8%,
      hsl(0, 0%, 50.92%) 64.7%,
      hsl(0, 0%, 41.88%) 71%,
      hsl(0, 0%, 32.25%) 77.5%,
      hsl(0, 0%, 22.04%) 84.5%,
      hsl(0, 0%, 11.29%) 91.9%,
      hsl(0, 0%, 0%) 100%
    );
    --fg: rgba(255, 252, 121, 0.75);
    --thumb-border: hsl(0deg, 0%, calc((1 - (var(--v) * 0.75)) * 100%));
  }
</style>
