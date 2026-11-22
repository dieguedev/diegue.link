const ITEM_CLASS =
  'mx-3 text-2xl md:mx-4 md:text-4xl [&_svg]:size-7 md:[&_svg]:size-10';

export default function Marquee({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="relative flex w-full overflow-hidden border-b-2 border-t-2 border-border bg-secondary-background text-foreground font-base">
      <div className="animate-marquee whitespace-nowrap flex items-center py-4 md:py-6">
        {items.map((item, _index) => {
          return (
            <span key={_index} className={ITEM_CLASS}>
              {item}
            </span>
          );
        })}
      </div>

      <div className="absolute inset-y-0 animate-marquee2 whitespace-nowrap flex items-center">
        {items.map((item, _index) => {
          return (
            <span key={_index} className={ITEM_CLASS}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}
