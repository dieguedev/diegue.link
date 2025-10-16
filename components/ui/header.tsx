import React from 'react';

function Header({ ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-white inline-block p-2 transform -rotate-2 border-2 border-black"
      {...props}
    />
  );
}

export { Header };
