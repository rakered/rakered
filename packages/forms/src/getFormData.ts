import hash, { HashResult } from '@rakered/hash';

const parsers = {
  'datetime-local': (el) => (el.value === '' ? undefined : new Date(el.value)),
  checkbox: (el) =>
    Boolean(el.checked) && el.value !== 'on' ? el.value : Boolean(el.checked),
  number: (el) => (el.value === '' ? undefined : Number(el.value)),
  password: (el) => (el.value === '' ? undefined : hash(el.value)),
  radio: (el) => (el.checked ? el.value : undefined),
  range: (el) => (el.value === '' ? undefined : Number(el.value)),
  text: (el) => el.value.trim(),
};

// rename the type, as that makes more sense in this context
export type HashedPassword = HashResult;

export interface Event {
  readonly currentTarget: EventTarget | null;
  preventDefault(): void;
}

export type DataType =
  | string
  | number
  | boolean
  | Date
  | HashedPassword
  | FormData;

export interface FormData {
  [key: string]: DataType | DataType[];
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
    const value = parse(element) ?? undefined;

    if (typeof value === 'undefined') {
      continue;
    }

    // a[b][c] becomes [ a, b, c ]
    const path = element.name.replace(/\[([^\]]+)?\]/g, '.$1').split('.');
    let pointer = data;

    // walk the path, and create objects and arrays where required
    for (let i = 0; i < path.length - 1; i++) {
      // empty strings and numeric values, indicate arrays
      pointer[path[i]] =
        pointer[path[i]] || (/^$|^[0-9]*$/.test(path[i + 1]) ? [] : {});

      pointer = pointer[path[i]];
    }

    if (Array.isArray(pointer)) {
      // don't push checkboxes without values into array
      if (typeof value === 'boolean') {
        continue;
      }

      pointer.push(value);
    } else {
      pointer[path[path.length - 1]] = value;
    }
  }

  return data as T;
}
