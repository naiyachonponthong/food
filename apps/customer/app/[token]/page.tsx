"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ListTree } from "lucide-react";
import { SessionHeader } from "@/components/SessionHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MenuCard } from "@/components/MenuCard";
import { CartBar } from "@/components/CartBar";
import { categories, getMenusByCategory, menus, restaurant } from "@/lib/mock-data";
import { RestaurantCover, RestaurantLogo } from "@/components/BrandImage";
import { categoryIcon } from "@/components/Icons";

export default function MenuBrowsePage() {
  const [activeCat, setActiveCat] = useState("featured");
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredMenus = query.trim()
    ? menus.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.nameEn.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  const scrollToCategory = (id: string) => {
    setActiveCat(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <main className="relative pb-32">
      {/* Cover image with restaurant info */}
      <div className="relative">
        <div className="relative h-72 overflow-hidden">
          <RestaurantCover className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-cream-100" />
        </div>

        {/* Sticky header overlay */}
        <div className="absolute inset-x-0 top-0">
          <SessionHeader scrolled={scrolled} />
        </div>

        {/* Logo + name floating card */}
        <div className="relative z-10 -mt-20 px-4">
          <div className="rounded-3xl bg-white p-5 pt-6 shadow-lift">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-pop">
                  <RestaurantLogo className="h-full w-full" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    {restaurant.nameEn}
                  </p>
                  <h1 className="text-2xl font-bold leading-tight text-ink-800">
                    {restaurant.name}
                  </h1>
                </div>
              </div>
              <div className="flex h-7 items-center gap-1 rounded-full bg-herb-50 px-2.5 text-xs font-semibold text-herb-700">
                <span className="h-2 w-2 rounded-full bg-herb-500 animate-pulse" />
                เปิด
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {restaurant.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky category + search */}
      <div className="sticky top-[60px] z-20 -mx-0 bg-cream-100/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 pt-4">
          <button
            aria-label="ค้นหา"
            onClick={() => setSearchOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-cream-300"
          >
            <Search className="h-5 w-5 text-ink-700" />
          </button>
          <button
            aria-label="หมวดหมู่"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-cream-300"
          >
            <ListTree className="h-5 w-5 text-ink-700" />
          </button>
          <div className="ml-1 flex-1 overflow-hidden">
            <div className="-mb-3">
              <CategoryTabs active={activeCat} onChange={scrollToCategory} />
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="animate-fade-in-up px-4 pt-2 pb-3">
            <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-3 py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาเมนู..."
                className="flex-1 bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-300"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-ink-400"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu content */}
      <div ref={scrollRef} className="space-y-8 px-4 pt-6">
        {filteredMenus ? (
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink-800">
              ผลการค้นหา ({filteredMenus.length})
            </h2>
            <div className="space-y-3">
              {filteredMenus.map((m) => (
                <MenuCard key={m.id} menu={m} layout="list" />
              ))}
              {filteredMenus.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center text-ink-400">
                  ไม่พบเมนูที่ค้นหา
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Featured carousel */}
            <section
              ref={(el) => {
                sectionRefs.current["featured"] = el;
              }}
            >
              <SectionHeader
                iconId="featured"
                title="เมนูแนะนำ"
                subtitle="ขายดีจากครัวของเรา"
                tone="from-brand-400 to-accent-600"
              />
              <div className="grid grid-cols-2 gap-3">
                {getMenusByCategory("featured").map((m) => (
                  <MenuCard key={m.id} menu={m} layout="grid" />
                ))}
              </div>
            </section>

            {categories
              .filter((c) => c.id !== "featured")
              .map((cat) => {
                const items = getMenusByCategory(cat.id);
                if (items.length === 0) return null;
                return (
                  <section
                    key={cat.id}
                    ref={(el) => {
                      sectionRefs.current[cat.id] = el;
                    }}
                  >
                    <SectionHeader
                      iconId={cat.id}
                      title={cat.name}
                      subtitle={cat.nameEn}
                    />
                    <div className="space-y-3">
                      {items.map((m) => (
                        <MenuCard key={m.id} menu={m} layout="list" />
                      ))}
                    </div>
                  </section>
                );
              })}
          </>
        )}
      </div>

      <CartBar />
    </main>
  );
}

function SectionHeader({
  iconId,
  title,
  subtitle,
  tone = "from-slate-400 to-slate-600",
}: {
  iconId: string;
  title: string;
  subtitle?: string;
  tone?: string;
}) {
  const Icon = categoryIcon(iconId);
  return (
    <div className="mb-4 flex items-end justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} shadow-soft`}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-ink-800">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
