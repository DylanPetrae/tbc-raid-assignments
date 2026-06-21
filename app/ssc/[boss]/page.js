import Link from "next/link";
import { sscBosses } from "@/data/bosses";
import { bossDataBySlug } from "@/data/bossData";
import BossTemplate from "@/components/BossTemplate";

export function generateStaticParams() {
  return sscBosses.map((b) => ({ boss: b.slug }));
}

export async function generateMetadata({ params }) {
  const { boss } = await params;
  const meta = sscBosses.find((b) => b.slug === boss);
  return { title: meta ? `${meta.name} — SSC — TBC Raid Templates` : "Boss not found" };
}

export default async function SscBossPage({ params }) {
  const { boss: slug } = await params;
  const meta = sscBosses.find((b) => b.slug === slug);

  if (!meta) {
    return (
      <div className="coming-soon-wrap">
        <h1>Boss not found</h1>
        <p>That isn&apos;t one of the SSC bosses.</p>
        <Link className="back-link" href="/ssc">
          ← Back to Serpentshrine Cavern
        </Link>
      </div>
    );
  }

  const boss = bossDataBySlug[slug];

  if (!boss) {
    return (
      <div className="coming-soon-wrap">
        <h1>{meta.name}</h1>
        <p>This position template hasn&apos;t been built yet — check back soon.</p>
        <Link className="back-link" href="/ssc">
          ← Back to Serpentshrine Cavern
        </Link>
      </div>
    );
  }

  return <BossTemplate boss={boss} />;
}
