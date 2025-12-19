import { Star8, Star9, Star16, Star22, Star27 } from '../stars';

const STAR_COMPONENTS = {
  9: Star9,
  16: Star16,
  22: Star22,
  27: Star27,
} as const;

type StarNumber = keyof typeof STAR_COMPONENTS;

interface StarProps {
  starNumber: StarNumber;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  color?: string;
}

function StarWithStroke({
  starNumber,
  size = 50,
  strokeWidth = 6,
  strokeColor = 'black',
  color = 'var(--main)',
  ...props
}: React.SVGProps<SVGSVGElement> & StarProps) {
  const Component = STAR_COMPONENTS[starNumber];

  return (
    <Component
      color={color}
      size={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export default StarWithStroke;
