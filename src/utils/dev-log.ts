export function devLog(message: string, scope: string = ''): void {
  if (import.meta.env.DEV) {
    const scopeLabel = scope ? `[${scope}]` : ''
    console.log(`[DEV] ${scopeLabel} ${message}`);
  }
}

export function devWarn(message: string, scope: string = ''): void {
  if (import.meta.env.DEV) {
    const scopeLabel = scope ? `[${scope}]` : ''
    console.warn(`[DEV WARN] ${scopeLabel} ${message}`);
  }
}

export function devError(message: string, scope: string = ''): void {
  if (import.meta.env.DEV) {
    const scopeLabel = scope ? `[${scope}]` : ''
    console.error(`[DEV ERROR] ${scopeLabel} ${message}`);
  }
}
