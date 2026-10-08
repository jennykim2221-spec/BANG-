import { cards, characters } from "../content/index.ts";
export type DistanceInput = {
  seats: string[];
  eliminated: string[];
  actor: string;
  target: string;
  scope: boolean;
  rose: boolean;
  mustang: boolean;
  paul: boolean;
  weapon: string;
  card: "bang" | "panic";
};
export function calculateDistance(i: DistanceInput) {
  const alive = i.seats.filter((s) => !i.eliminated.includes(s));
  const a = alive.indexOf(i.actor),
    t = alive.indexOf(i.target);
  if (alive.length < 2 || a < 0 || t < 0 || a === t) return null;
  const base = Math.min(Math.abs(a - t), alive.length - Math.abs(a - t));
  const actorModifier =
    (i.scope ? cards.find((c) => c.id === "scope")!.distanceModifier! : 0) +
    (i.rose
      ? characters.find((c) => c.id === "rose-doolan")!.distanceModifier
      : 0);
  const targetModifier =
    (i.mustang ? cards.find((c) => c.id === "mustang")!.distanceModifier! : 0) +
    (i.paul
      ? characters.find((c) => c.id === "paul-regret")!.distanceModifier
      : 0);
  const effective = Math.max(1, base + targetModifier - actorModifier);
  const weaponRange = cards.find((c) => c.id === i.weapon)?.range ?? 1;
  return {
    base,
    actorModifier,
    targetModifier,
    effective,
    weaponRange,
    reachable: effective <= (i.card === "panic" ? 1 : weaponRange),
  };
}
