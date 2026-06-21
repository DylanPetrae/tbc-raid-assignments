"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Top site nav. Client component so it can highlight the current section.
// `/` matches exactly; section links (`/ssc`, `/tk`) also match their boss
// subpages (e.g. /ssc/lady-vashj) so the parent stays highlighted.
const LINKS = [
  { href: "/ssc", label: "Serpentshrine Cavern" },
  { href: "/tk", label: "Tempest Keep" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <Link href="/" className="brand" aria-current={pathname === "/" ? "page" : undefined}>
        TBC Raid Templates
      </Link>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
