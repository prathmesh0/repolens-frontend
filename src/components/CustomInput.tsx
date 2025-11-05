'use client';

import * as React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface CustomInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  label?: string;
  onStartIcon?: React.ReactNode;
  onEndIcon?: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      className,
      label,
      type,
      placeholder,
      required,
      onStartIcon,
      onEndIcon,
      error,
      hint,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === 'password';
    const inputType =
      isPasswordType && showPassword
        ? 'text'
        : isPasswordType
        ? 'password'
        : type;

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const PasswordIcon = showPassword ? EyeOff : Eye;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={props.id}
            className="text-sm font-semibold text-secondary"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
        )}

        <div className="relative flex w-full items-center">
          {onStartIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              {onStartIcon}
            </div>
          )}

          <Input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-md border text-sm font-normal transition-all duration-200',
              'border-gray-300 bg-white text-gray-800 placeholder-gray-400',
              'hover:primary focus:border-primary focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:hover:border-primary dark:focus:border-primary dark:focus:ring-primary',
              error && 'border-red-500 focus:ring-red-200',
              onStartIcon ? 'pl-10' : 'pl-3',
              onEndIcon || isPasswordType ? 'pr-10' : 'pr-3',
              className
            )}
            {...props}
          />

          {isPasswordType ? (
            <button
              type="button"
              title="Toggle password visibility"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary dark:text-gray-400 "
              tabIndex={-1}
            >
              <PasswordIcon size={18} />
            </button>
          ) : (
            onEndIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                {onEndIcon}
              </div>
            )
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {!error && hint && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;
