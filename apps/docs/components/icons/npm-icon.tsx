import { cn } from "@/lib/utils";

interface NpmIconProps {
	className?: string;
	size?: string | number;
}

export function NpmIcon({ className, size = "1em" }: NpmIconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 128 128"
			className={cn("text-[#cb3837] dark:text-[#cb3837]", className)}
		>
			<path
				fill="currentColor"
				d="M0 7.062C0 3.225 3.225 0 7.062 0h113.88c3.838 0 7.063 3.225 7.063 7.062v113.88c0 3.838-3.225 7.063-7.063 7.063H7.062c-3.837 0-7.062-3.225-7.062-7.063zm23.69 97.518h40.395l.05-58.532h19.494l-.05 58.581h19.543l.05-78.075l-78.075-.1l-.1 78.126z"
			/>
			<path
				className="fill-white dark:fill-stone-950"
				d="M25.105 65.52V26.512H40.96c8.72 0 26.274.034 39.008.075l23.153.075v77.866H83.645v-58.54H64.057v58.54H25.105z"
			/>
		</svg>
	);
}
