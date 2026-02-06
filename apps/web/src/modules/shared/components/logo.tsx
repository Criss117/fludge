import { cn } from "../lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 200, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <rect width="200" height="200" rx="40" fill="var(--background)" />
      <path
        d="M60 100C60 77.9086 77.9086 60 100 60C111.046 60 121.046 64.4772 128.284 71.7157"
        stroke="oklch(0.7686 0.1647 70.0804)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M140 100C140 122.091 122.091 140 100 140C88.9543 140 78.9543 135.523 71.7157 128.284"
        stroke="oklch(0.7686 0.1647 70.0804)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="1 20"
      />
      <rect
        x="90"
        y="85"
        width="30"
        height="30"
        rx="6"
        fill="oklch(0.7686 0.1647 70.0804)"
        transform="rotate(45 105 100)"
      />
      <circle
        cx="128.284"
        cy="71.7157"
        r="8"
        fill="oklch(0.9869 0.0214 95.2774)"
      />
    </svg>
  );
}
