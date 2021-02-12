import { getFormData, Event, FormData } from './getFormData';

export function handleSubmit<T extends FormData>(fn: (values: T) => any) {
  return function submit(event: Event) {
    event.preventDefault();

    const values = getFormData<T>(event);
    return fn(values) ?? false;
  };
}
