"use client";

import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

interface NavContextValue {
	isTransparent: boolean;
}

const NavContext = createContext<NavContextValue>({ isTransparent: false });

export function useNav() {
	return useContext(NavContext);
}

export interface NavProviderProps {
	transparentMode?: "none" | "top";
}

export function NavProvider({
	transparentMode = "none",
	children,
}: NavProviderProps & { children: ReactNode }) {
	const [transparent, setTransparent] = useState(transparentMode !== "none");

	useEffect(() => {
		if (transparentMode !== "top") return;

		const listener = () => {
			if (document.documentElement.hasAttribute("data-anchor-scrolling")) {
				return;
			}
			setTransparent(window.scrollY < 10);
		};

		listener();
		window.addEventListener("scroll", listener, { passive: true });
		return () => {
			window.removeEventListener("scroll", listener);
		};
	}, [transparentMode]);

	return (
		<NavContext.Provider
			value={useMemo(() => ({ isTransparent: transparent }), [transparent])}
		>
			{children}
		</NavContext.Provider>
	);
}
