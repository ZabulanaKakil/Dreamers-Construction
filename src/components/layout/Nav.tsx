"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { company } from "@/data/company";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { services as staticServices } from "@/data/services";
import { asset } from "@/lib/asset";

type NavLeaf = { href: string; label: string };
type NavMenuEntry =
  | NavLeaf
  | { href?: string; label: string; children: NavLeaf[] };

type NavItem =
  | { href: string; label: string; menu?: undefined }
  | { href: string; label: string; menu: NavMenuEntry[] };

const constructionServiceLeaves: NavLeaf[] = staticServices
  .filter((s) => s.category === "construction")
  .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
  .map((s) => ({
    href: `/projects?service=${s.id}`,
    label: s.title,
  }));

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/projects",
    label: "Projects",
    menu: [
      { href: "/projects", label: "All Projects" },
      { href: "/projects?portfolio=construction", label: "Construction" },
      { href: "/projects?portfolio=residences", label: "Residential & Developer" },
      {
        label: "By Status",
        children: [
          { href: "/projects?status=ongoing", label: "Ongoing" },
          { href: "/projects?status=completed", label: "Completed" },
          { href: "/projects?status=upcoming", label: "Upcoming" },
        ],
      },
      {
        label: "By Service",
        children: constructionServiceLeaves,
      },
    ],
  },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function hasChildren(
  entry: NavMenuEntry,
): entry is { href?: string; label: string; children: NavLeaf[] } {
  return "children" in entry && Array.isArray(entry.children);
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const pathOnly = href.split("?")[0]!;
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function linkClass(active: boolean) {
  const base =
    "relative inline-flex items-center pb-0.5 text-sm font-medium transition-colors";
  if (active) {
    return `${base} font-semibold text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:content-['']`;
  }
  return `${base} text-muted hover:text-foreground`;
}

const panelClass =
  "rounded-[var(--radius-md)] border border-border bg-surface-elevated py-2 shadow-[var(--panel-shadow)]";

function MenuItemLink({
  href,
  label,
  onNavigate,
  className = "",
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      className={`block px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent ${className}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

function SubmenuFlyout({
  entry,
  onNavigate,
}: {
  entry: { href?: string; label: string; children: NavLeaf[] };
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuId = useId();

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  };

  useEffect(() => () => clearClose(), []);

  const triggerClass =
    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-accent";

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        clearClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={() => {
        clearClose();
        setOpen(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      {entry.href ? (
        <Link
          href={entry.href}
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={submenuId}
          className={triggerClass}
          onClick={onNavigate}
        >
          <span>{entry.label}</span>
          <span className="text-[10px] opacity-70" aria-hidden>
            ▸
          </span>
        </Link>
      ) : (
        <button
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={submenuId}
          className={triggerClass}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{entry.label}</span>
          <span className="text-[10px] opacity-70" aria-hidden>
            ▸
          </span>
        </button>
      )}
      {open && (
        <div
          id={submenuId}
          role="menu"
          className={`absolute left-full top-0 z-[70] ml-1 min-w-[14rem] max-w-[20rem] ${panelClass}`}
        >
          <ul className="max-h-[min(70vh,28rem)] overflow-y-auto">
            {entry.children.map((child) => (
              <li key={child.href}>
                <MenuItemLink
                  href={child.href}
                  label={child.label}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function NavDropdown({
  item,
  pathname,
}: {
  item: Extract<NavItem, { menu: NavMenuEntry[] }>;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const active = isNavActive(pathname, item.href);

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearClose(), []);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={() => {
        clearClose();
        setOpen(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <Link
        href={item.href}
        className={`${linkClass(active)} gap-1`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        {item.label}
        <span className="text-[10px] opacity-70" aria-hidden>
          ▾
        </span>
      </Link>
      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute left-0 top-full z-[60] mt-2 min-w-[12.5rem] ${panelClass}`}
        >
          <ul>
            {item.menu.map((entry) =>
              hasChildren(entry) ? (
                <SubmenuFlyout
                  key={entry.label}
                  entry={entry}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <li key={entry.href}>
                  <MenuItemLink
                    href={entry.href}
                    label={entry.label}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileSubBranch({
  entry,
  onNavigate,
}: {
  entry: { href?: string; label: string; children: NavLeaf[] };
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="mt-1">
      <div className="flex items-center gap-1">
        {entry.href ? (
          <Link
            href={entry.href}
            onClick={onNavigate}
            className="flex min-h-10 flex-1 items-center text-sm text-muted hover:text-accent"
          >
            {entry.label}
          </Link>
        ) : (
          <span className="flex min-h-10 flex-1 items-center text-sm text-foreground">
            {entry.label}
          </span>
        )}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-muted"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} ${entry.label} options`}
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden>{expanded ? "−" : "+"}</span>
        </button>
      </div>
      {expanded && (
        <ul className="mb-1 ml-3 space-y-0.5 border-l border-border pl-3">
          {entry.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="flex min-h-10 items-center text-sm text-muted hover:text-accent"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileNavBranch({
  item,
  pathname,
  onNavigate,
}: {
  item: Extract<NavItem, { menu: NavMenuEntry[] }>;
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = isNavActive(pathname, item.href);

  return (
    <div className="border-b border-border/60 pb-2">
      <div className="flex items-center gap-2">
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`min-h-11 flex-1 text-lg font-medium ${
            active ? "text-accent underline decoration-2 underline-offset-4" : "text-foreground"
          }`}
        >
          {item.label}
        </Link>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-muted"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} ${item.label} links`}
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden>{expanded ? "−" : "+"}</span>
        </button>
      </div>
      {expanded && (
        <ul className="mb-2 ml-3 space-y-1 border-l border-border pl-3">
          {item.menu.map((entry) =>
            hasChildren(entry) ? (
              <MobileSubBranch
                key={entry.label}
                entry={entry}
                onNavigate={onNavigate}
              />
            ) : (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  onClick={onNavigate}
                  className="flex min-h-10 items-center text-sm text-muted hover:text-accent"
                >
                  {entry.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src={asset("/images/brand/logo.jpg")}
            alt={`${company.name} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-border object-cover"
            priority
          />
          <span className="flex flex-col">
            <span className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-foreground">
              {company.shortName}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-accent">
              Construction
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.menu ? (
              <NavDropdown key={item.href} item={item} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(isNavActive(pathname, item.href))}
              >
                {item.label}
              </Link>
            ),
          )}
          <ThemeSwitcher compact />
          <Link href="/contact" className="btn-primary btn-sm text-xs">
            Get a quote
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitcher compact />
          <button
            type="button"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background/95 px-4 py-6 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) =>
              item.menu ? (
                <MobileNavBranch
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`min-h-11 text-lg font-medium ${
                    isNavActive(pathname, item.href)
                      ? "text-accent underline decoration-2 underline-offset-4"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-2 border-t border-border pt-4">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary btn-sm w-full text-center text-xs"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
