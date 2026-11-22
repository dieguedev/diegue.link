import { TwinkleStars } from '@/components/ui/twinkle-stars';

interface HighlightedTextProps {
  svgSize?: number;
}

function HighlightedText({
  svgSize = 45,
  ...props
}: React.ComponentProps<'span'> & HighlightedTextProps) {
  return (
    <span
      className="group relative inline-block -rotate-2 px-3 sm:mr-2 mr-0 [&_svg]:size-[0.7em] bg-main rounded-base border-2 border-border shadow-shadow"
      {...props}
    >
      {props.children}
      <TwinkleStars size={svgSize} color="var(--secondary-background)" />
    </span>
  );
}

export { HighlightedText };
