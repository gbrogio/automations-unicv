import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { cn } from "@/utils/cn";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<head />
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased dark flex items-center justify-center h-screen",
					fontSans.variable,
				)}
			>
				{children}
				<ToastContainer />
			</body>
		</html>
	);
}

