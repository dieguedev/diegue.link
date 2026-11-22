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
      className="group relative px-2 sm:mr-2 mr-0 [&_svg]:size-6 sm:[&_svg]:size-[32px] md:[&_svg]:size-[45px] bg-main/50 rounded-base border-2 border-border/40"
      {...props}
    >
      {props.children}
      <TwinkleStars size={svgSize} />
    </span>
  );
}

export { HighlightedText };
