import { cn } from '@/lib/utils/cn';

const DOT_DELAYS_MS = [0, 150, 300];

interface DotLoaderProps {
  className?: string;
  label?: string;
}

function DotLoader({ className, label = 'Cargando' }: DotLoaderProps) {
  return (
    <span
      role="status"
      className={cn('inline-flex items-center gap-1', className)}
    >
      {DOT_DELAYS_MS.map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current animate-dot-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { DotLoader };
