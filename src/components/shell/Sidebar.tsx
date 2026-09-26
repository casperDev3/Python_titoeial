import type { NavItem } from "@/content/nav";
import { Brand } from "./Brand";
import { NavList } from "./NavList";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside
      className="glass fixed top-3 bottom-3 left-3 z-40 hidden w-[var(--sidebar-w)] flex-col !rounded-[28px] lg:flex"
    >
      <div className="p-5 pb-4">
        <Brand />
      </div>
      <NavList items={items} />
    </aside>
  );
}
