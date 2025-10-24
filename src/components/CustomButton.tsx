import * as React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

interface ICustomButton extends ButtonProps {
  prefixIcon?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, ICustomButton>(
  ({ className, children, prefixIcon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        {prefixIcon && <span className="flex items-center">{prefixIcon}</span>}
        {children}
      </Button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export default CustomButton;
