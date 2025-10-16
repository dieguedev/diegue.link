function Navbar({ ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className="fixed left-0 top-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 border-border bg-secondary-background px-5 justify-end"
      {...props}
    />
  );
}

export { Navbar };
