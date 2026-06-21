import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 className="page-h1">TBC RAID POSITION TEMPLATES</h1>
      <div className="page-subtitle">
        Pick a raid, pick a boss, fill in names, export or save for next week.
      </div>

      <div className="raid-hub-grid">
        <Link href="/ssc" className="raid-hub-card">
          <h2>Serpentshrine Cavern</h2>
          <p>Hydross · Lurker Below · Leotheras · Karathress · Morogrim · Lady Vashj</p>
        </Link>
        <Link href="/tk" className="raid-hub-card">
          <h2>Tempest Keep</h2>
          <p>Al&apos;ar · Void Reaver · Solarian · Kael&apos;thas Sunstrider</p>
        </Link>
      </div>
    </div>
  );
}
