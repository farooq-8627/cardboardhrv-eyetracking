"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const menuItems = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/live-monitor", label: "Live Monitor" },
		{ href: "/connect-phone", label: "Connect Phone" },
		{ href: "/eye-tracking", label: "Eye Tracking" },
		{ href: "/pupil-diameter", label: "Pupil Diameter" },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/90 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link href="/" className="text-white text-xl font-bold">
							CardboardHRV
						</Link>
					</div>

					{/* Desktop menu */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-4">
							{menuItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>

					<div className="hidden md:block">
						<Button
							variant="default"
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							Start Monitoring
						</Button>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
						>
							<span className="sr-only">Open main menu</span>
							{!isOpen ? (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
								onClick={() => setIsOpen(false)}
							>
								{item.label}
							</Link>
						))}
						<Button
							variant="default"
							className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
						>
							Start Monitoring
						</Button>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
