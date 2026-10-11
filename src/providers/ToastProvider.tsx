import { Toaster } from 'sonner';

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" theme="system" />
    </>
  );
};

export default ToastProvider;
