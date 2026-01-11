"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
	IconLink,
	BookIcon,
	GitHubIcon,
	XIcon,
} from "./changelog-layout";

interface Release {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	published_at: string;
	html_url: string;
	author: {
		login: string;
		avatar_url: string;
	};
}

interface DefaultChangelogProps {
	releases: Release[];
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function DefaultChangelog({ releases }: DefaultChangelogProps) {
	return (
		<div className="relative grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-16">
			{/* Left sidebar - sticky */}
			<div className="lg:sticky lg:top-24 lg:h-fit">
				<div className="space-y-6">
					<h1 className="text-2xl font-bold tracking-tight">Changelogs</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						All of the changes made to Misque will be available here. Stay up
						to date with the latest features, improvements, and bug fixes.
					</p>

					<div className="pt-4 space-y-3">
						<IconLink
							href="/docs"
							icon={<BookIcon className="w-4 h-4" />}
							label="Documentation"
						/>
						<IconLink
							href="https://github.com/asadkomi/misque"
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
								<Link
									href={release.html_url}
									target="_blank"
									className="text-xl font-semibold hover:text-primary transition-colors"
								>
									{release.tag_name}
								</Link>
								<time className="text-sm text-muted-foreground">
									{formatDate(release.published_at)}
								</time>
							</div>

							{/* Release name if different from tag */}
							{release.name && release.name !== release.tag_name && (
								<h2 className="text-lg font-medium mb-4">{release.name}</h2>
							)}

							{/* Release body */}
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<ReactMarkdown
									components={{
										h1: ({ children }) => (
											<h1 className="text-xl font-bold mt-6 mb-4">
												{children}
											</h1>
										),
										h2: ({ children }) => (
											<h2 className="text-lg font-semibold mt-5 mb-3">
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-base font-medium mt-4 mb-2">
												{children}
											</h3>
										),
										p: ({ children }) => (
											<p className="text-muted-foreground mb-3">{children}</p>
										),
										ul: ({ children }) => (
											<ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
												{children}
											</ul>
										),
										li: ({ children }) => <li>{children}</li>,
										a: ({ href, children }) => (
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline"
											>
												{children}
											</a>
										),
										code: ({ children }) => (
											<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
												{children}
											</code>
										),
										pre: ({ children }) => (
											<pre className="p-4 rounded-lg bg-muted overflow-x-auto mb-4">
												{children}
											</pre>
										),
									}}
								>
									{release.body || "No release notes available."}
								</ReactMarkdown>
							</div>

							{/* Author */}
							{release.author && (
								<div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
									<img
										src={release.author.avatar_url}
										alt={release.author.login}
										className="w-6 h-6 rounded-full"
									/>
									<span className="text-sm text-muted-foreground">
										Released by{" "}
										<Link
											href={`https://github.com/${release.author.login}`}
											target="_blank"
											className="text-foreground hover:text-primary transition-colors"
										>
											@{release.author.login}
										</Link>
									</span>
								</div>
							)}
						</article>
					))
				)}
			</div>
		</div>
	);
}
