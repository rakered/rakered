import { ButtonHTMLAttributes, ReactNode, useState } from 'react';

import Spinner from './spinner';
import CheckIcon from './check-icon';
import CrossIcon from './cross-icon';

export interface ButtonProps {
  ariaErrorAlert: string;
  ariaLoadingAlert: string;
  ariaSuccessAlert: string;
  ariaText: string;
  state: 'idle' | 'loading' | 'success' | 'error';
  text: ReactNode;
  color?: 'gray' | 'blue';
}

const colors = {
  error: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    ring: 'focus:ring-red-700',
  },
  success: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    ring: 'focus:ring-green-700',
  },
};

const graySchema = {
  idle: {
    bg: 'bg-gray-800',
    hover: 'hover:bg-gray-900',
    ring: 'focus:ring-gray-800',
  },
  loading: {
    bg: 'bg-gray-800',
    hover: 'hover:bg-gray-900',
    ring: 'focus:ring-gray-800',
  },
};

const blueSchema = {
  idle: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    ring: 'focus:ring-blue-600',
  },
  loading: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    ring: 'focus:ring-blue-600',
  },
};

function Button({
  ariaErrorAlert,
  ariaLoadingAlert,
  ariaSuccessAlert,
  ariaText,
  state,
  text,
  color,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [derivedState, setDerivedState] = useState(state);
  const [previousState, setPreviousState] = useState(state);

  if (derivedState !== state) {
    setPreviousState(derivedState);
    setDerivedState(state);
  }

  const getDirection = (activeState: ButtonProps['state']) =>
    state === activeState
      ? 'enter'
      : previousState === activeState
      ? 'enter'
      : null;

  const idle = (
    <span
      hidden={state !== 'idle'}
      aria-hidden={true}
      data-rakered-direction={getDirection('idle')}
    >
      <span data-rakered-slider>{text}</span>
    </span>
  );

  const loading = (
    <span
      hidden={state !== 'loading'}
      aria-hidden={true}
      data-rakered-direction={getDirection('loading')}
    >
      <span data-rakered-slider>
        <Spinner />
      </span>
    </span>
  );

  const success = (
    <span
      hidden={state !== 'success'}
      aria-hidden={true}
      data-rakered-direction={getDirection('success')}
    >
      <span data-rakered-slider>
        <CheckIcon />
      </span>
    </span>
  );

  const error = (
    <span
      hidden={state !== 'error'}
      aria-hidden={true}
      data-rakered-direction={getDirection('error')}
    >
      <span data-rakered-slider>
        <CrossIcon />
      </span>
    </span>
  );

  const label =
    state === 'loading'
      ? ariaLoadingAlert
      : state === 'error'
      ? ariaErrorAlert
      : state === 'success'
      ? ariaSuccessAlert
      : ariaText;

  const colorSchema = Object.assign(
    {},
    colors,
    color === 'blue' ? blueSchema : graySchema,
  )[state];

  return (
    <button
      data-rakered-button
      aria-live="assertive"
      aria-label={label}
      className={`w-full p-2 border border-transparent shadow-sm hover:shadow-md text-base font-medium rounded-md text-white ${colorSchema.bg} ${colorSchema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorSchema.ring}`}
      {...props}
    >
      {idle}
      {loading}
      {success}
      {error}
    </button>
  );
}

export default Button;
