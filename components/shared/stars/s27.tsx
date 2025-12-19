export function Star27({
  color,
  size,
  stroke,
  strokeWidth,
  pathClassName,
  width,
  height,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  color?: string;
  size?: number;
  stroke?: string;
  pathClassName?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 200 200"
      width={size ?? width}
      height={size ?? height}
      {...props}
    >
      <path
        fill={color ?? 'currentColor'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={pathClassName}
        d="M195 195c-54.245-54.245-135.755-54.245-190 0C59.245 140.755 59.245 59.245 5 5c54.245 54.245 135.755 54.245 190 0-54.245 54.245-54.245 135.755 0 190"
      />
    </svg>
  );
}
