export function Star22({
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
        d="M158.603 100c78.169 75.604 16.906 136.867-58.603 58.603C24.396 236.867-36.867 175.604 41.397 100-36.867 24.396 24.396-36.867 100 41.397 175.604-36.867 236.867 24.396 158.603 100"
      />
    </svg>
  );
}
