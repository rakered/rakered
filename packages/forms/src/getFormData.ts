import hash, { HashResult } from '@rakered/hash';

const parsers = {
  'datetime-local': (el) => new Date(el.value),
  checkbox: (el) => Boolean(el.checked),
  number: (el) => Number(el.value),
  password: (el) => hash(el.value),
  radio: (el) => (el.checked ? el.value : undefined),
  range: (el) => Number(el.value),
  text: (el) => el.value,
};

// rename the type, as that makes more sense in this context
export type HashedPassword = HashResult;

export interface Event {
  readonly currentTarget: EventTarget | null;
  preventDefault(): void;
}

export interface FormData {
  [key: string]: string | number | Date | HashedPassword;
}

export function getFormData<T extends FormData>(
  target: HTMLFormElement | Event,
): T {
  const form: HTMLFormElement =
    'currentTarget' in target ? target.currentTarget : target;

  const elements: any = form.elements;
  const data: any = {};

  for (const element of elements) {
    if (!element.name) {
      continue;
    }

    const parse = parsers[element.type] || parsers.text;
    data[element.name] = parse(element) ?? data[element.name] ?? undefined;
  }

  return data as T;
}
