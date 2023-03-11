// throttle throttles calls to fn to at most once per delay milliseconds.
export function throttle<T extends any[]>(
  delay: number,
  fn: (..._: T) => void
) {
  let throttled = false;
  let nextArgs: T | null = null;

  const unthrottle = () => {
    if (nextArgs) {
      // We're not done yet. Call the function again.
      fn(...nextArgs);
      // Mark the nextArgs as consumed and reset the timer.
      nextArgs = null;
      setTimeout(unthrottle, delay);
    } else {
      // We're done. Finally unthrottle.
      throttled = false;
    }
  };

  return (...args: T) => {
    // Check if we are being throttled. If we are, then we'll defer the call
    // until we're unthrottled.
    if (throttled) {
      nextArgs = args;
      return;
    }

    // We're not being throttled. Mark ourselves as throttled and call the
    // function.
    throttled = true;
    fn(...args);
    setTimeout(unthrottle, delay);
  };
}
