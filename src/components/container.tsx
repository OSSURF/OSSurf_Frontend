import { cn } from '../lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <section className={cn('max-w-4xl mx-auto ', className)}>
      {children}
    </section>
  );
}
