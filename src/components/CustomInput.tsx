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
            className="text-[13px] font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
        )}

        <div className="relative flex w-full items-center">
          {onStartIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {onStartIcon}
            </div>
          )}

          <Input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={cn(
              'w-full text-sm font-normal bg-background hover:border-foreground/25',
              error && 'border-destructive focus-visible:ring-destructive/20',
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              <PasswordIcon size={18} />
            </button>
          ) : (
            onEndIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {onEndIcon}
              </div>
            )
          )}
        </div>

        {error && <p className="mt-0.5 text-xs text-destructive">{error}</p>}
        {!error && hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;
