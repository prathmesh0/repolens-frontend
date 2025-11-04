import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  className?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ className }) => {
  return (
    <div>
      <Spinner className={cn('h-4 w-4 text-primary animate-spin', className)} />
    </div>
  );
};

export default CustomLoader;
