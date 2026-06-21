import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "TBC Raid Position Templates",
  description:
    "Fillable boss-position templates for TBC Classic raid officers - Serpentshrine Cavern and Tempest Keep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="site-nav">
          <Link href="/" className="brand">
            TBC Raid Templates
          </Link>
          <Link href="/ssc">Serpentshrine Cavern</Link>
          <Link href="/tk">Tempest Keep</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
