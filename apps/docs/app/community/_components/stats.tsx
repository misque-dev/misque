import Link from "next/link";
import { Github, MessageCircle, Twitter } from "lucide-react";
import { cn } from "@misque/ui/lib/utils";
import { ChevronRightIcon } from "lucide-react";

function kFormatter(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
	}
	return num.toString();
}

interface StatsProps {
	npmDownloads: number | null;
	githubStars: number | null;
}

interface StatCardProps {
	href?: string;
	icon: React.ReactNode;
	iconColor: string;
	label: string;
	title: string;
	description: string;
	metric?: string | null;
	metricLabel?: string;
	actionText?: string;
	disabled?: boolean;
	index: number;
	totalItems: number;
}

function StatCard({
	href,
	icon,
	iconColor,
	label,
	title,
	description,
	metric,
	metricLabel,
	actionText,
	disabled,
	index,
	totalItems,
}: StatCardProps) {
	const content = (
		<div
			className={cn(
				"relative p-6 md:p-8 group hover:bg-muted/30 transition-colors duration-200 flex flex-col h-full",
				// Small screens: bottom border for all except last
				index < totalItems - 1 && "border-b md:border-b-0",
				// Medium screens (3 columns): right border for left/middle, bottom border for top row
				index % 3 !== 2 && "md:border-r",
				index < 3 && "md:border-b"
			)}
		>
			<div className="flex items-center gap-2 mb-4">
				<div className={cn("flex items-center justify-center", iconColor)}>
					{icon}
				</div>
				<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					{label}
				</span>
			</div>

			<h3 className="text-xl font-medium text-primary dark:text-zinc-100 mb-2">
				{title}
			</h3>

			<p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>

			{metric !== undefined && (
				<div className="mb-4">
					<p className="text-3xl font-bold text-foreground">{metric ?? "—"}</p>
					{metricLabel && (
						<p className="text-xs text-muted-foreground mt-1">{metricLabel}</p>
					)}
				</div>
			)}

			{actionText && !disabled && (
				<span className="inline-flex items-center text-sm text-blue-500 hover:text-blue-500/80 transition-colors group-hover:underline mt-auto">
					{actionText}
					<ChevronRightIcon className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
				</span>
			)}

			{actionText && disabled && (
				<span className="text-sm text-muted-foreground mt-auto">
					{actionText}
				</span>
			)}
		</div>
	);

	if (href && !disabled) {
		return (
			<Link href={href} target="_blank" className="contents">
				{content}
			</Link>
		);
	}

	return content;
}

export function Stats({ npmDownloads, githubStars }: StatsProps) {
	const stats = [
		{
			href: "https://github.com/misque-dev/misque/discussions",
			icon: <MessageCircle className="w-4 h-4" />,
			iconColor: "text-emerald-500",
			label: "Community",
			title: "GitHub Discussions",
			description: "Ask questions, share ideas, and discuss features",
			actionText: "Join Discussion",
		},
		{
			icon: (
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
				</svg>
			),
			iconColor: "text-indigo-500",
			label: "Chat",
			title: "Discord",
			description: "Chat with the community in real-time",
			actionText: "Coming Soon",
			disabled: true,
		},
		{
			href: "https://x.com/misquedev",
			icon: <Twitter className="w-4 h-4" />,
			iconColor: "text-sky-500",
			label: "Social",
			title: "Twitter / X",
			description: "Follow for updates and announcements",
			actionText: "Follow Us",
		},
		{
			icon: (
				<svg className="w-4 h-4" viewBox="0 0 128 128" fill="currentColor">
					<path d="M0 7.062C0 3.225 3.225 0 7.062 0h113.88c3.838 0 7.063 3.225 7.063 7.062v113.88c0 3.838-3.225 7.063-7.063 7.063H7.062c-3.837 0-7.062-3.225-7.062-7.063zm23.69 97.518h40.395l.05-58.532h19.494l-.05 58.581h19.543l.05-78.075l-78.075-.1l-.1 78.126z" />
				</svg>
			),
			iconColor: "text-red-500",
			label: "Downloads",
			title: "npm Downloads",
			description: "Total package downloads last month",
			metric: npmDownloads ? kFormatter(npmDownloads) : null,
			metricLabel: "monthly downloads",
		},
		{
			href: "https://github.com/misque-dev/misque",
			icon: <Github className="w-4 h-4" />,
			iconColor: "text-amber-500",
			label: "Open Source",
			title: "GitHub Stars",
			description: "Star the repository to show your support",
			metric: githubStars ? kFormatter(githubStars) : null,
			metricLabel: "stars on GitHub",
			actionText: "Star on GitHub",
		},
		{
			href: "https://www.npmjs.com/org/misque",
			icon: (
				<svg
					className="w-4 h-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
					<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
					<line x1="12" y1="22.08" x2="12" y2="12" />
				</svg>
			),
			iconColor: "text-purple-500",
			label: "Packages",
			title: "7 Packages",
			description: "Modular libraries for Islamic applications",
			actionText: "View on npm",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-0 border">
			{stats.map((stat, index) => (
				<StatCard
					key={stat.title}
					{...stat}
					index={index}
					totalItems={stats.length}
				/>
			))}
		</div>
	);
}
