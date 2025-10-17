export default function Marquee({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="relative h-[15dvh] flex w-full overflow-x-hidden overflow-y-hidden border-b-2 border-t-2 border-border bg-secondary-background text-foreground font-base">
      <div className="h-[15dvh] animate-marquee whitespace-nowrap flex items-center">
        {items.map((item, _index) => {
          return (
            <span key={_index} className="mx-4 text-4xl">
              {item}
            </span>
          );
        })}
      </div>

      <div className="absolute h-[15dvh] top-0 animate-marquee2 whitespace-nowrap flex items-center">
        {items.map((item, _index) => {
          return (
            <span key={_index} className="mx-4 text-4xl">
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}
