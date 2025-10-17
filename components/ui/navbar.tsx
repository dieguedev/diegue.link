function Navbar({ ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className="mx-auto flex min-h-[10dvh] w-full items-center border-b-4 border-border bg-secondary-background px-5"
      {...props}
    />
  );
}

export { Navbar };
