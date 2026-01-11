import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	size?: number;
}

export function Logo({ className, size = 20 }: LogoProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 400 400"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("text-foreground", className)}
		>
			<rect
				x="15"
				y="15"
				width="370"
				height="370"
				stroke="currentColor"
				strokeWidth="30"
			/>
			<rect x="90" y="90" width="220" height="220" fill="currentColor" />
		</svg>
	);
}
