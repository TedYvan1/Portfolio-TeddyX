"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/** Navigation de l'admin : colonne sur grand écran, bande défilante sur mobile. */
export function AdminNav({ groups }: { groups: { title: string; items: NavItem[] }[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Administration" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:p-0">
      {groups.map(group => (
        <div key={group.title} className="contents lg:block">
          <p className="eyebrow hidden lg:mb-2 lg:block">{group.title}</p>
          <ul className="contents lg:grid lg:gap-0.5">
            {group.items.map(item => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-(--radius) px-3 py-2 text-sm whitespace-nowrap transition-colors ${active ? "bg-surface-2 font-semibold text-foreground" : "text-muted hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
