import * as store from "svelte/store";
import * as jsonbin from "./jsonbin.js";

export type State = {
  on: boolean;
  w: number;
  h: number;
  s: number;
  v: number;
};

function defaultState(): State {
  return {
    on: true,
    w: 100,
    h: 365 / 2,
    s: 0,
    v: 0,
  };
}

export async function restoreState(bin: jsonbin.Bin<State>): Promise<State> {
  const data = await bin.get();
  const state = data.record;
  if (
    state.on === undefined ||
    state.w === undefined ||
    state.h === undefined ||
    state.s === undefined ||
    state.v === undefined
  ) {
    return defaultState();
  }

  return state;
}

export async function saveState(bin: jsonbin.Bin<State>, s = store.get(state)) {
  await bin.put(s);
}

export const state = store.writable<State>(defaultState());
