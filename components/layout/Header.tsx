"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
	{ path: "/", label: "Home" },
	{ path: "/monitor", label: "Monitor" },
	{ path: "/connect-phone", label: "Connect Phone" },
	{ path: "/about", label: "About" },
];

export function Header() {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<div className="mr-8">
					<Link
						href="/"
						className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text"
					>
						CardboardHRV
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex flex-1 items-center space-x-6">
					{navigationItems.map((item) => (
						<Link
							key={item.path}
							href={item.path}
							className={cn(
								"text-sm font-medium transition-colors hover:text-primary",
								pathname === item.path
									? "text-primary"
									: "text-muted-foreground"
							)}
						>
							{item.label}
						</Link>
					))}
				</nav>

				{/* Mobile Navigation */}
				<div className="flex md:hidden flex-1 justify-end">
					<nav className="fixed bottom-0 left-0 right-0 border-t bg-background p-2">
						<div className="grid grid-cols-4 gap-1">
							{navigationItems.map((item) => (
								<Link
									key={item.path}
									href={item.path}
									className={cn(
										"flex flex-col items-center justify-center py-2 text-xs font-medium rounded-md transition-colors hover:text-primary",
										pathname === item.path
											? "text-primary bg-muted"
											: "text-muted-foreground"
									)}
								>
									{item.label}
								</Link>
							))}
						</div>
					</nav>
				</div>

				{/* Theme Toggle */}
				<Button
					variant="ghost"
					size="icon"
					className="ml-auto md:ml-0"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					<SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</div>
		</header>
	);
}
