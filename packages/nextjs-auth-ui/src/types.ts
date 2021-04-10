export type State<T = undefined> =
  | { status: 'idle' }
  | { status: 'loading'; values: T }
  | { status: 'success' }
  | { status: 'error'; error: string; values: T };
