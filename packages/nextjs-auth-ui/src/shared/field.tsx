import { hash } from '@rakered/hash';
import cn from 'clsx';
import {
  Children,
  cloneElement,
  ReactElement,
  ReactNode,
  useState,
} from 'react';

import Input from './input';

function Field({
  label,
  alt,
  error,
  description,
  required,
  children,
  variant,
}: {
  label?: ReactNode;
  error?: ReactNode;
  alt?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  required?: boolean;
  variant?: 'description-below';
}) {
  const [id] = useState(() =>
    hash([label, description].filter(Boolean).join('-')).digest.substr(0, 5),
  );

  const childNodes = Children.toArray(children) as ReactElement[];
  const invalid = childNodes[0]?.props.invalid || !!error;
  const inputId = `i-${id}`;
  const errorId = `e-${id}`;
  const descriptionId = `d-${id}`;

  const descriptionElement = description ? (
    <div
      id={descriptionId}
      className={cn('text-xs text-gray-500', {
        'mb-2': variant !== 'description-below',
        'mt-2': variant === 'description-below',
      })}
    >
      {description}
    </div>
  ) : null;

  // the relative is to catch grammarly. Grammarly locates the nearest
  // relative element, and positions inside that. Without this relative
  // it will keep walking, and potentially end up in a element with a space-y-..
  return (
    <div className="flex flex-col relative">
      {label ? (
        <div className="mb-1 flex justify-between items-center font-medium text-sm text-gray-500">
          <div>
            <label htmlFor={inputId}>{label}</label>
            {required ? (
              <span className="ml-1 text-red-600 font-medium">*</span>
            ) : null}
          </div>
          {error ? (
            <span role="alert" id={errorId} className="text-red-700">
              {error}
            </span>
          ) : null}
          {alt ? <span>{alt}</span> : null}
        </div>
      ) : null}

      {variant !== 'description-below' && descriptionElement}

      {childNodes.length === 1
        ? cloneElement(childNodes[0], {
            ...childNodes[0].props,
            id: inputId,
            invalid:
              (childNodes[0].type as any).name === Input.name
                ? invalid
                : undefined,
            required: childNodes[0].props.required || required,
            'aria-invalid': invalid,
            'aria-describedby': [error && errorId, description && descriptionId]
              .filter(Boolean)
              .join(' '),
          })
        : children}

      {variant === 'description-below' && descriptionElement}
    </div>
  );
}

export default Field;
