let toastFn: ((msg: string) => void) | null = null

export const setToastHandler = (fn: (msg: string) => void) => {
  toastFn = fn
}

export const triggerToast = (msg: string) => {
  if (toastFn) toastFn(msg)
}
