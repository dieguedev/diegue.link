import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { DotLoader } from '@/components/ui/dot-loader';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-[translate,box-shadow] duration-150 ease-ui [-webkit-tap-highlight-color:transparent] gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none',
        noShadow: 'text-main-foreground bg-main border-2 border-border',
        neutral:
          'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none',
        reverse:
          'text-main-foreground bg-main border-2 border-border hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow active:translate-x-reverseBoxShadowX active:translate-y-reverseBoxShadowY active:shadow-shadow',
      },
      size: {
        hero: 'h-14 px-8 py-2',
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type CommonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  className?: string;
};

function Button(
  props: React.ComponentProps<'button'> &
    CommonProps & { link?: false; loading?: boolean },
): React.JSX.Element;

function Button(
  props: React.ComponentProps<'a'> & CommonProps & { link: true; href: string },
): React.JSX.Element;

function Button({
  className,
  variant,
  size,
  asChild = false,
  link,
  loading = false,
  disabled,
  children,
  ...props
}: any) {
  const Comp = asChild ? Slot : link ? 'a' : 'button';

  if (loading && !asChild && !link) {
    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size }),
          'relative disabled:opacity-100',
          className,
        )}
        disabled
        aria-busy="true"
        {...props}
      >
        <span className="invisible inline-flex items-center gap-2">
          {children}
        </span>
        <DotLoader className="absolute inset-0 justify-center" />
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
