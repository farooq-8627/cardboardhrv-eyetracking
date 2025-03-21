import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Connect Phone - CardboardHRV",
	description:
		"Connect your phone to CardboardHRV for heart rate monitoring using your phone's camera.",
};

export default function ConnectPhoneLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
