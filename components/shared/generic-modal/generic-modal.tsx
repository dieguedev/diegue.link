import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface GenericModalProps {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function GenericModal({ title, trigger, children }: GenericModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in-0 duration-200" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none animate-in fade-in-0 zoom-in-95 duration-200">
          <VisuallyHidden>
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          </VisuallyHidden>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
