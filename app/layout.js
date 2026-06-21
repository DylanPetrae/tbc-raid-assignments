import SiteNav from "@/components/SiteNav";
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
        <SiteNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
