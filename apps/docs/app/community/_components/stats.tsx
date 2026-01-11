import Link from "next/link";
import { Github, MessageCircle, Twitter } from "lucide-react";

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

export function Stats({ npmDownloads, githubStars }: StatsProps) {
	return (
		<div className="grid gap-6">
			{/* Top row - 3 columns */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* GitHub Discussions */}
				<Link
					href="https://github.com/asadkomi/misque/discussions"
					target="_blank"
					className="group relative flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
				>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
						<MessageCircle className="w-6 h-6" />
					</div>
					<h3 className="text-lg font-semibold mb-2">GitHub Discussions</h3>
					<p className="text-sm text-muted-foreground text-center">
						Ask questions, share ideas, and discuss features
					</p>
					<span className="mt-4 text-sm text-primary group-hover:underline">
						Join Discussion
					</span>
				</Link>

				{/* Discord */}
				<div className="relative flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
						<svg
							className="w-6 h-6"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold mb-2">Discord</h3>
					<p className="text-sm text-muted-foreground text-center">
						Chat with the community in real-time
					</p>
					<span className="mt-4 text-sm text-muted-foreground">
						Coming Soon
					</span>
				</div>

				{/* Twitter/X */}
				<Link
					href="https://x.com/misquedev"
					target="_blank"
					className="group relative flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
				>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
						<Twitter className="w-6 h-6" />
					</div>
					<h3 className="text-lg font-semibold mb-2">Twitter / X</h3>
					<p className="text-sm text-muted-foreground text-center">
						Follow for updates and announcements
					</p>
					<span className="mt-4 text-sm text-primary group-hover:underline">
						Follow Us
					</span>
				</Link>
			</div>

			{/* Bottom row - 2 columns */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* npm Downloads */}
				<div className="relative flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
						<svg
							className="w-6 h-6"
							viewBox="0 0 128 128"
							fill="currentColor"
						>
							<path d="M0 7.062C0 3.225 3.225 0 7.062 0h113.88c3.838 0 7.063 3.225 7.063 7.062v113.88c0 3.838-3.225 7.063-7.063 7.063H7.062c-3.837 0-7.062-3.225-7.062-7.063zm23.69 97.518h40.395l.05-58.532h19.494l-.05 58.581h19.543l.05-78.075l-78.075-.1l-.1 78.126z" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold mb-2">npm Downloads</h3>
					<p className="text-3xl font-bold text-primary">
						{npmDownloads ? kFormatter(npmDownloads) : "—"}
					</p>
					<p className="text-sm text-muted-foreground mt-2">Total downloads</p>
				</div>

				{/* GitHub Stars */}
				<Link
					href="https://github.com/asadkomi/misque"
					target="_blank"
					className="group relative flex flex-col items-center justify-center p-8 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
				>
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
						<Github className="w-6 h-6" />
					</div>
					<h3 className="text-lg font-semibold mb-2">GitHub Stars</h3>
					<p className="text-3xl font-bold text-primary">
						{githubStars ? kFormatter(githubStars) : "—"}
					</p>
					<p className="text-sm text-muted-foreground mt-2 group-hover:underline">
						Star on GitHub
					</p>
				</Link>
			</div>
		</div>
	);
}
