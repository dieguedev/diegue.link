'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface AnimateSizeProps {
  children: React.ReactNode;
  className?: string;
}

interface Size {
  width: number;
  height: number;
}

function AnimateSize({ children, className }: AnimateSizeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(([entry]) => {
      const { inlineSize, blockSize } = entry.borderBoxSize[0];
      setSize({ width: inlineSize, height: blockSize });
    });
    observer.observe(content);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'overflow-hidden transition-[width,height] duration-300 ease-ui motion-reduce:transition-none',
        className,
      )}
      style={size}
    >
      <div ref={contentRef} className="w-max">
        {children}
      </div>
    </div>
  );
}

export { AnimateSize };
