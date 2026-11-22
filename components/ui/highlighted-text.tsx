import StarWithStroke from '@/components/ui/star-with-stroke';

interface HighlightedTextProps {
  svgSize?: number;
}

function HighlightedText({
  svgSize = 45,
  ...props
}: React.ComponentProps<'span'> & HighlightedTextProps) {
  return (
    <span
      className="relative px-2 sm:mr-2 mr-0 [&_svg]:size-6 sm:[&_svg]:size-[32px] md:[&_svg]:size-[45px] bg-main/50 rounded-base border-2 border-border/40"
      {...props}
    >
      {props.children}
      <StarWithStroke
        starNumber={9}
        size={svgSize}
        className="absolute md:-bottom-4 md:-right-5 -bottom-2.5 -right-2.5"
      />
      <StarWithStroke
        starNumber={9}
        size={svgSize}
        className="absolute md:-top-4 md:-left-5 -top-2.5 -left-2.5"
      />
    </span>
  );
}

export { HighlightedText };
