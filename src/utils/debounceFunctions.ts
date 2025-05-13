// debounce.ts (no need for .tsx unless used inside a React component file)
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  wait: number,
  context: any = null
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let callbackArgs: Parameters<T>;

  const later = () => {
    callback.apply(context, callbackArgs);
  };

  return function (...args: Parameters<T>): void {
    callbackArgs = args;
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
