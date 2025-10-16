import StarWithStroke from './starWithStroke';

interface HighlightedTextProps {
  svgSize?: number;
}

function HighlightedText({
  svgSize = 45,
  ...props
}: React.ComponentProps<'span'> & HighlightedTextProps) {
  return (
    <span
      className="relative px-2 sm:mr-2 mr-0 md:[&_svg]:size-[45px] sm:[&_svg]:size-[32px] bg-main/50 rounded-base border-2 border-border/40 dark:border-border/70"
      {...props}
    >
      {props.children}
      <StarWithStroke
        starNumber={9}
        size={svgSize}
        className="absolute sm:block hidden md:-bottom-4 md:-right-5 -bottom-2.5 -right-2.5"
      />
      <StarWithStroke
        starNumber={9}
        size={svgSize}
        className="absolute sm:block hidden md:-top-4 md:-left-5 -top-2.5 -left-2.5"
      />
    </span>
  );
}

export { HighlightedText };
