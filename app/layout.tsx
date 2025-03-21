import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "CardboardHRV",
	description: "Cost-Effective Heart Rate Variability Monitoring System",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					inter.className,
					"min-h-screen bg-background antialiased"
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="relative flex min-h-screen flex-col">
						<Header />
						<main className="flex-1">{children}</main>
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
