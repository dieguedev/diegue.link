import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import * as React from 'react';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils/cn';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li data-slot="pagination-item" className={cn('', className)} {...props} />
  );
}

type PaginationLinkProps = React.ComponentProps<typeof Link> & {
  isActive?: boolean;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

function PaginationLink({
  className,
  isActive,
  disabled,
  size = 'icon',
  children,
  ...props
}: PaginationLinkProps) {
  const classes = cn(
    buttonVariants({ variant: 'noShadow', size }),
    'bg-background text-foreground tabular-nums',
    isActive && 'bg-main text-main-foreground',
    disabled && 'pointer-events-none opacity-50',
    className,
  );

  // Un enlace deshabilitado no es navegable: se pinta sin href
  if (disabled) {
    return (
      <span
        data-slot="pagination-link"
        aria-disabled="true"
        aria-label={props['aria-label']}
        className={classes}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      data-slot="pagination-link"
      aria-current={isActive ? 'page' : undefined}
      className={classes}
      {...props}
    >
      {children}
    </Link>
  );
}

function PaginationPrevious({
  className,
  label,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label: string }) {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-4', className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label: string }) {
  return (
    <PaginationLink
      data-slot="pagination-next"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-4', className)}
      {...props}
    >
      <span className="hidden sm:inline">{label}</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  label,
  ...props
}: React.ComponentProps<'span'> & { label: string }) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn('flex size-10 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
