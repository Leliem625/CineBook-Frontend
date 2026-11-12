"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Movie } from "@/lib/types";
import { addDays, dayMonth } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { ChevronLeft, ChevronRight, StarIcon } from "./icons";

type Tab = "NOW_SHOWING" | "COMING_SOON";

export default function MovieCarousel({ movies }: { movies: Movie[] }) {
  const [tab, setTab] = useState<Tab>("NOW_SHOWING");
  const today = useToday();
  const scroller = useRef<HTMLDivElement>(null);

  const list = movies.filter((m) => m.status === tab);
  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12">
      <div className="mb-6 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Mua vé theo phim</h2>
        <div className="inline-flex rounded-full bg-surface p-1 text-sm font-medium">
          {(
            [
              ["NOW_SHOWING", "Đang chiếu"],
              ["COMING_SOON", "Sắp chiếu"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                scroller.current?.scrollTo({ left: 0 });
              }}
              className={`rounded-full px-5 py-1.5 transition-colors ${
                tab === key ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Phim trước"
          onClick={() => scroll(-1)}
          className="absolute top-[38%] -left-3 z-10 hidden h-10 w-10 place-items-center rounded-full bg-white shadow-md ring-1 ring-line hover:text-brand md:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {list.map((m) => {
            const isNew = today && m.releaseDate && m.releaseDate <= today && m.releaseDate > addDays(today, -7);
            return (
              <article
                key={m.id}
                className="group w-[160px] shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-line sm:w-[190px]"
              >
                <Link href={`/phim/${m.slug}`} className="relative block aspect-[2/3] bg-surface">
                  {m.posterUrl && (
                    <Image
                      src={m.posterUrl}
                      alt={m.title}
                      fill
                      sizes="190px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {isNew && (
                    <span className="absolute top-2 left-2 rounded bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                      MỚI
                    </span>
                  )}
                  {m.ageRating && (
                    <span className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {m.ageRating}
                    </span>
                  )}
                  <span
                    className={`absolute inset-x-0 bottom-0 py-2 text-center text-sm font-semibold text-white ${
                      m.status === "NOW_SHOWING" ? "bg-brand group-hover:bg-brand-dark" : "bg-ink/80"
                    }`}
                  >
                    {m.status === "NOW_SHOWING" ? "Mua vé" : "Sắp chiếu"}
                  </span>
                </Link>
                <div className="space-y-1 p-3">
                  <h3 className="truncate font-semibold" title={m.title}>
                    {m.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>{dayMonth(m.releaseDate)}</span>
                    {m.score ? (
                      <span className="flex items-center gap-1 font-medium text-amber-600">
                        <StarIcon className="h-3.5 w-3.5" />
                        {m.score.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
          {list.length === 0 && <p className="w-full py-16 text-center text-muted">Chưa có phim.</p>}
        </div>

        <button
          type="button"
          aria-label="Phim tiếp theo"
          onClick={() => scroll(1)}
          className="absolute top-[38%] -right-3 z-10 hidden h-10 w-10 place-items-center rounded-full bg-white shadow-md ring-1 ring-line hover:text-brand md:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
