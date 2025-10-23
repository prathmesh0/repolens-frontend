import styles from '@/styles/toast.module.css';
import { ExternalToast, toast } from 'sonner';

export class Toast {
  public static default(
    message: string | React.ReactNode,
    data?: ExternalToast
  ) {
    toast(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#f8f9fa',
        color: '#212529',
      },
      className: styles.default,

      ...data,
    });
  }

  public static success(
    message: string | React.ReactNode,
    data?: ExternalToast
  ) {
    toast.success(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#5AD4B2',
        color: '#ffffff',
      },
      className: styles.success,
      ...data,
    });
  }

  public static warning(
    message: string | React.ReactNode,
    data?: ExternalToast
  ) {
    toast.warning(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#FF5653',
        color: '#ffffff',
      },
      className: styles.warning,
      ...data,
    });
  }

  public static error(message: string | React.ReactNode, data?: ExternalToast) {
    toast.error(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#FF6952',
        color: '#ffffff',
      },
      className: styles.error,

      ...data,
    });
  }

  public static info(message: string | React.ReactNode, data?: ExternalToast) {
    toast.info(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#E7C551',
        color: '#ffffff',
      },
      className: styles.info,
      ...data,
    });
  }

  public static loading(
    message: string | React.ReactNode,
    data?: ExternalToast
  ) {
    toast.loading(message, {
      style: {
        borderRadius: 0,
        border: 0,
        backgroundColor: '#704FE5',
        color: '#ffffff',
      },
      className: styles.loading,
      ...data,
    });
  }

  public static promise<T>({
    promise,
    onError,
    onSuccess,
    onloading,
    description,
  }: {
    promise: Promise<T>;
    onSuccess?: (data: T) => string;
    onloading?: string | React.ReactNode;
    onError?: string | React.ReactNode;
    description?: string | React.ReactNode;
  }) {
    toast.promise(promise, {
      success: (data) => {
        if (onSuccess) {
          return onSuccess(data);
        }
        return 'Promise Resolved';
      },
      loading: onloading || 'Loading...',
      error: onError || 'Error',
      style: { borderRadius: 0, border: 0 },
      description,
      className: styles.promise,
    });
  }
}
