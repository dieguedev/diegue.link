import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { shake } from '@/lib/utils/shake';

export function registerInline<T extends FieldValues>(form: UseFormReturn<T>) {
  return (name: Path<T>) =>
    form.register(name, {
      onBlur: async (e: React.FocusEvent<HTMLInputElement>) => {
        if (!e.target.value) return;

        const wasInvalid = form.getFieldState(name).invalid;
        const isValid = await form.trigger(name);
        if (!isValid && !wasInvalid) shake(e.target);
      },
      onChange: () => {
        if (form.getFieldState(name).invalid) void form.trigger(name);
      },
    });
}
