import * as bulbstate from "./bulbstate.js";

export type State = {
  t0: number; // temperature
  n0: number; // saturation
  h0: number; // hue
  d0: number; // brightness
};

const minTemperature = 153;
const maxTemperature = 500;

export function convert(bulbState: bulbstate.State): State {
  return {
    t0: Math.round(
      (bulbState.w / 100) * (maxTemperature - minTemperature) + minTemperature
    ),
    n0: Math.round(bulbState.s),
    h0: Math.round(bulbState.h),
    d0: Math.round(bulbState.v),
  };
}

export function encode(state: State): string {
  const params = new URLSearchParams({
    m: "1",
    t0: state.t0.toString(),
    n0: state.n0.toString(),
    h0: state.h0.toString(),
    d0: state.d0.toString(),
  });
  return params.toString();
}
