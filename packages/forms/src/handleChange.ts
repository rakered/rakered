import { getFormData, Event, FormData } from './getFormData';

export function handleChange<T extends FormData>(fn: (values: T) => any) {
  return function change(event: Event) {
    const values = getFormData<T>(event);
    return fn(values);
  };
}
