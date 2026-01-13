"use client";

import {
	IconLink,
	BookIcon,
	GitHubIcon,
	XIcon,
} from "./changelog-layout";
import type { ChangelogRelease, PackageUpdate } from "./changelog-data";

interface DefaultChangelogProps {
	releases: ChangelogRelease[];
}

function getTypeColor(type: PackageUpdate['type']) {
	switch (type) {
		case 'major':
			return 'bg-red-500/10 text-red-500 border-red-500/20';
		case 'minor':
			return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
		case 'patch':
			return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
	}
}

function PackageCard({ pkg }: { pkg: PackageUpdate }) {
	return (
		<div className="border border-border rounded-sm p-4 space-y-3">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<code className="text-sm font-mono font-medium text-foreground">
						{pkg.name}
					</code>
					<span className="text-xs text-muted-foreground">
						v{pkg.version}
					</span>
				</div>
				<span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(pkg.type)}`}>
					{pkg.type}
				</span>
			</div>
			<ul className="space-y-1.5">
				{pkg.changes.map((change, idx) => (
					<li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
						<span className="text-muted-foreground/50 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
						{change}
					</li>
				))}
			</ul>
		</div>
	);
}

export function DefaultChangelog({ releases }: DefaultChangelogProps) {
	return (
		<div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
			{/* Left sidebar - sticky */}
			<div className="lg:sticky lg:top-24 lg:h-fit">
				<div className="space-y-6">
					<h1 className="text-2xl font-bold tracking-tight">Changelogs</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						All of the changes made to Misque packages. Stay up to date with the latest features, improvements, and bug fixes.
					</p>

					<div className="pt-4 space-y-3">
						<IconLink
							href="/docs"
							icon={<BookIcon className="w-4 h-4" />}
							label="Documentation"
						/>
						<IconLink
							href="https://github.com/misque-dev/misque"
							icon={<GitHubIcon className="w-4 h-4" />}
							label="GitHub"
							external
						/>
						<IconLink
							href="/community"
							icon={
								<svg
									className="w-4 h-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
							}
							label="Community"
						/>
					</div>

					<div className="pt-6 border-t border-border">
						<IconLink
							href="https://x.com/misquedev"
							icon={<XIcon className="w-4 h-4" />}
							label="Follow on X"
							external
						/>
					</div>
				</div>
			</div>

			{/* Right content - scrollable */}
			<div className="space-y-12">
				{releases.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-muted-foreground">No releases yet.</p>
						<p className="text-sm text-muted-foreground mt-2">
							Check back soon for updates!
						</p>
					</div>
				) : (
					releases.map((release) => (
						<article
							key={release.id}
							className="relative pb-12 border-b border-border last:border-0"
						>
							{/* Version header */}
							<div className="flex items-center gap-4 mb-6">
								<h2 className="text-xl font-semibold text-foreground">
									{release.version}
								</h2>
								<time className="text-sm text-muted-foreground">
									{release.date}
								</time>
							</div>

							{/* Package updates */}
							<div className="space-y-4">
								{release.packages.map((pkg) => (
									<PackageCard key={`${release.id}-${pkg.name}`} pkg={pkg} />
								))}
							</div>
						</article>
					))
				)}
			</div>
		</div>
	);
}
