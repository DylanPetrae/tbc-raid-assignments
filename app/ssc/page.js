import Link from "next/link";
import { sscBosses } from "@/data/bosses";

export const metadata = { title: "Serpentshrine Cavern — TBC Raid Templates" };

export default function SscIndexPage() {
  return (
    <div>
      <h1 className="page-h1">SERPENTSHRINE CAVERN</h1>
      <div className="page-subtitle">Coilfang Reservoir — pick a boss</div>

      <div className="boss-grid">
        {sscBosses.map((boss) => (
          <Link key={boss.slug} href={`/ssc/${boss.slug}`} className="boss-card">
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
