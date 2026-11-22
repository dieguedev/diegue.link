function Navbar({ ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className="mx-auto flex h-16 w-full items-center border-b-2 border-border bg-secondary-background pl-4 md:pl-6"
      {...props}
    />
  );
}

export { Navbar };
