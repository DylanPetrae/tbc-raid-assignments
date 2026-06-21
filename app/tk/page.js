import Link from "next/link";
import { tkBosses } from "@/data/bosses";

export const metadata = { title: "Tempest Keep — TBC Raid Templates" };

export default function TkIndexPage() {
  return (
    <div>
      <h1 className="page-h1">TEMPEST KEEP</h1>
      <div className="page-subtitle">The Eye — pick a boss</div>

      <div className="boss-grid">
        {tkBosses.map((boss) => (
          <Link key={boss.slug} href={`/tk/${boss.slug}`} className="boss-card">
            <span className="boss-card-name">{boss.name}</span>
            <span className={`boss-card-tag ${boss.ready ? "ready" : ""}`}>
              {boss.ready ? "Ready" : "Coming soon"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
