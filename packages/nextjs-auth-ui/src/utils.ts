import { State } from './types';

export function getError(state: State<any>, match?: RegExp): string | null {
  if (!('error' in state)) {
    return null;
  }

  if (!match) {
    return state.error || null;
  }

  return match.test(state.error) ? state.error : null;
}
