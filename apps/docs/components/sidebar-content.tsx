import {
	BookOpen,
	Clock,
	Compass,
	Calendar,
	Rocket,
	Box,
	FileText,
	Code,
	type LucideIcon,
} from "lucide-react";

type SidebarItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	isNew?: boolean;
	group?: boolean;
};

type SidebarSection = {
	title: string;
	Icon: LucideIcon;
	isNew?: boolean;
	list: SidebarItem[];
};

export const contents: SidebarSection[] = [
	{
		title: "Get Started",
		Icon: Rocket,
		list: [
			{
				title: "Introduction",
				href: "/docs",
				icon: FileText,
			},
			{
				title: "Getting Started",
				href: "/docs/getting-started",
				icon: Rocket,
			},
		],
	},
	{
		title: "Packages",
		Icon: Box,
		list: [
			{
				title: "@misque/quran",
				href: "/docs/packages/quran",
				icon: BookOpen,
			},
			{
				title: "@misque/prayer-times",
				href: "/docs/packages/prayer-times",
				icon: Clock,
			},
			{
				title: "@misque/qibla",
				href: "/docs/packages/qibla",
				icon: Compass,
			},
			{
				title: "@misque/hijri",
				href: "/docs/packages/hijri",
				icon: Calendar,
			},
		],
	},
];

export const examples: SidebarSection[] = [
	{
		title: "Examples",
		Icon: Code,
		list: [
			{
				title: "Basic Usage",
				href: "/docs/examples/basic-usage",
				icon: Code,
			},
		],
	},
];
