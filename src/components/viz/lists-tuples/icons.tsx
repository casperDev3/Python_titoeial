"use client";

import {
  Anchor,
  Beef,
  Bone,
  BookOpen,
  ChefHat,
  Citrus,
  Coins,
  Compass,
  Crosshair,
  Crown,
  Gem,
  Map as MapIcon,
  Music,
  Skull,
  Snowflake,
  Stethoscope,
  Swords,
  Waves,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Outline-іконки членів команди (замість емодзі-аватарів). */
export const CREW_ICON: Record<string, LucideIcon> = {
  Luffy: Crown,
  Zoro: Swords,
  Nami: Compass,
  Usopp: Crosshair,
  Sanji: ChefHat,
  Chopper: Stethoscope,
  Robin: BookOpen,
  Franky: Wrench,
  Brook: Music,
  Jinbe: Waves,
  Vivi: Gem,
  Yamato: Snowflake,
};

/** Outline-іконки предметів у скринях. */
export const ITEM_ICON: Record<string, LucideIcon> = {
  map: MapIcon,
  gold: Coins,
  meat: Beef,
  anchor: Anchor,
  orange: Citrus,
  sake: Wine,
  bone: Bone,
  gem: Gem,
};

export function CrewIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const I = CREW_ICON[name] ?? Skull;
  return <I className={className} strokeWidth={1.75} aria-hidden />;
}
