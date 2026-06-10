import { matches } from "@/data/matches";

export function generateStaticParams() {
  return matches.map((m) => ({
    matchId: m.match_id,
  }));
}

export default function MatchDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
