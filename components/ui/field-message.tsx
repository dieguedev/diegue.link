import { cn } from '@/lib/utils/cn';

interface FieldMessageProps {
  id: string;
  error?: string;
  hint?: string;
  className?: string;
}

function FieldMessage({ id, error, hint, className }: FieldMessageProps) {
  const message = error ?? hint;
  if (!message) return null;

  return (
    <p
      id={id}
      className={cn(
        'text-sm',
        error ? 'text-red-700' : 'text-foreground/70',
        className,
      )}
    >
      {message}
    </p>
  );
}

export { FieldMessage };
