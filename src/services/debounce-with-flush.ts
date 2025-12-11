export function debounceWithFlush<T extends (...args: any[]) => Promise<void>>(fn: T, wait = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let pending: Promise<void> | null = null;

  const invoke = async () => {
    if (!lastArgs) return;
    const args = lastArgs;
    lastArgs = null;

    pending = fn(...args).catch(() => {})  // swallow to avoid unhandled rejection
      .finally(() => { pending = null; });

    await pending;
  };

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void invoke();
    }, wait);
  };

  debounced.flush = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (lastArgs) await invoke();
    if (pending) await pending;
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  return debounced as ((
    ...args: Parameters<T>
  ) => void) & { flush: () => Promise<void>; cancel: () => void };
}
