import { cn } from '@misque/ui/lib/utils';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className }: Props) => {
  return (
    <main className={cn('mx-auto max-w-7xl px-4', className)}>{children}</main>
  );
};
