import cn from 'clsx';

type InputProps = {
  invalid?: boolean;
  resize?: boolean;
  flat?: boolean;
  className?: string;
  status?: 'initial' | 'error' | 'success';
  type?: 'textarea' | string;
  'aria-label'?: string;
} & Record<string, unknown>;

function Input({
  invalid = false,
  type = 'text',
  status,
  ...props
}: InputProps) {
  const isError = invalid || status === 'error';
  const isSuccess = !isError && status === 'success';

  const className = cn(
    'border appearance-none rounded focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300',
    {
      'h-6 w-6 checked:bg-blue-600 checked:border-transparent text-sm focus:ring-offset-2':
        type === 'checkbox',
      'w-full appearance-none': type !== 'checkbox',
      'bg-red-100 border-red-300': isError,
      'bg-green-100 border-green-300': isSuccess,
      'bg-gray-100 text-gray-600': props.disabled || props.readOnly,
      'text-gray-900': !(props.disabled || props.readOnly),
      'py-2 px-3': type !== 'file',
    },
    props.className,
  );

  return <input title="" {...props} className={className} type={type} />;
}

export default Input;
