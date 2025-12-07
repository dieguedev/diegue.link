function Navbar({ ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className="mx-auto flex min-h-[10dvh] w-full items-center border-b-2 border-border bg-secondary-background pl-5"
      {...props}
    />
  );
}

export { Navbar };
