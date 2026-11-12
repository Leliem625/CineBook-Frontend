"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCinemaShowtimes } from "@/lib/api";
import { addDays, dayMonth, fullDate, priceShort, runtimeText, timeOf, versionLabel, weekdayShort } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import type { Cinema, Movie, Province, Showtime } from "@/lib/types";
import { InfoIcon } from "./icons";

const DAYS = 7;

type Props = { provinces: Province[]; cinemas: Cinema[]; movies: Movie[] };

/** Khối "Mua vé theo rạp": Khu vực -> Rạp (gom theo hãng) -> Ngày -> Suất chiếu. */
export default function BuyByCinema({ provinces, cinemas, movies }: Props) {
  const withCinemas = provinces.filter((p) => p.cinemaCount > 0);
  const [provinceSlug, setProvinceSlug] = useState(withCinemas[0]?.slug ?? "");
  // Rạp chọn sẵn = rạp đầu tiên đang hiển thị (theo thứ tự hãng đã sắp xếp)
  const firstCinemaOf = (slug: string) =>
    groupByChain(cinemas.filter((c) => c.provinceSlug === slug))[0]?.[1][0]?.id ?? null;
  const [cinemaId, setCinemaId] = useState<number | null>(() => firstCinemaOf(withCinemas[0]?.slug ?? ""));
  const today = useToday();
  const [pickedDate, setDate] = useState<string | null>(null);
  const date = pickedDate ?? today; // chưa chọn ngày -> mặc định hôm nay

  const chains = useMemo(() => groupByChain(cinemas.filter((c) => c.provinceSlug === provinceSlug)), [cinemas, provinceSlug]);
  const cinema = cinemas.find((c) => c.id === cinemaId) ?? null;

  const selectProvince = (slug: string) => {
    setProvinceSlug(slug);
    setCinemaId(firstCinemaOf(slug));
  };

  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">Mua vé theo rạp</h2>

        <div className="grid gap-5 lg:grid-cols-[250px_290px_1fr]">
          {/* ---------- Khu vực ---------- */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line lg:self-start">
            <div className="border-b border-line bg-surface/60 px-5 py-3 text-sm font-medium text-muted">Khu vực</div>
            <ul className="thin-scroll max-h-56 overflow-y-auto lg:max-h-[640px]">
              {withCinemas.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => selectProvince(p.slug)}
                    className={`flex w-full items-center justify-between border-b border-line/70 px-5 py-3 text-left transition-colors ${
                      p.slug === provinceSlug ? "bg-brand-soft font-semibold text-brand" : "hover:bg-surface"
                    }`}
                  >
                    {p.name}
                    <span
                      className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-semibold ${
                        p.slug === provinceSlug ? "bg-brand text-white" : "bg-ink/80 text-white"
                      }`}
                    >
                      {p.cinemaCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Rạp, gom theo hãng ---------- */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line lg:self-start">
            <div className="thin-scroll max-h-72 overflow-y-auto lg:max-h-[640px]">
              {chains.map(([chain, list]) => (
                <div key={chain}>
                  <div className="flex items-center gap-3 border-b border-line bg-surface/60 px-4 py-2.5 text-sm font-medium text-muted">
                    <ChainAvatar name={chain} />
                    {chain}
                    <span className="ml-auto text-xs">{list.length}</span>
                  </div>
                  {list.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCinemaId(c.id)}
                      className={`block w-full border-b border-line/70 px-5 py-3 text-left text-[15px] transition-colors ${
                        c.id === cinemaId ? "bg-brand font-medium text-white" : "hover:bg-surface"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Ngày + suất chiếu ---------- */}
          <div className="min-w-0 space-y-4">
            {today && date && (
              <div className="grid grid-cols-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line sm:grid-cols-7">
                {Array.from({ length: DAYS }, (_, i) => addDays(today, i)).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={`py-3 text-center transition-colors ${
                      d === date ? "bg-brand text-white" : "text-ink hover:bg-surface"
                    }`}
                  >
                    <div className="text-lg font-semibold">{dayMonth(d)}</div>
                    <div className={`text-xs ${d === date ? "text-white/85" : "text-muted"}`}>
                      {d === today ? "Hôm nay" : weekdayShort(d)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-notice/90 px-5 py-3 text-sm font-medium text-ink">
              <InfoIcon className="h-5 w-5 shrink-0" /> Nhấn vào suất chiếu để tiến hành mua vé
            </div>

            {cinema && date ? (
              <CinemaShowtimes key={`${cinema.id}-${date}`} cinema={cinema} date={date} movies={movies} />
            ) : (
              <p className="rounded-xl bg-white p-8 text-center text-muted ring-1 ring-line">Chọn rạp để xem lịch chiếu.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CinemaShowtimes({ cinema, date, movies }: { cinema: Cinema; date: string; movies: Movie[] }) {
  const [showtimes, setShowtimes] = useState<Showtime[] | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;
    getCinemaShowtimes(cinema.id, date).then((list) => {
      if (active) {
        setNow(Date.now());
        setShowtimes(list);
      }
    });
    return () => {
      active = false;
    };
  }, [cinema.id, date]);

  const byMovie = useMemo(() => groupByMovie(showtimes ?? [], movies), [showtimes, movies]);
  const mapUrl =
    cinema.lat && cinema.lng ? `https://www.google.com/maps/search/?api=1&query=${cinema.lat},${cinema.lng}` : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-line">
        <p className="text-lg font-semibold">
          {cinema.name} <span className="font-normal text-muted">· {fullDate(date)}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {cinema.address}
          {mapUrl && (
            <>
              {" · "}
              <a href={mapUrl} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
                Bản đồ
              </a>
            </>
          )}
        </p>
      </div>

      {showtimes === null && <SkeletonCards />}

      {showtimes !== null && byMovie.length === 0 && (
        <p className="rounded-xl bg-white p-10 text-center text-muted ring-1 ring-line">
          Rạp chưa có suất chiếu trong ngày này.
        </p>
      )}

      {byMovie.map(({ movie, versions }) => (
        <article key={movie.id} className="flex gap-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <Link href={`/phim/${movie.slug}`} className="relative hidden h-36 w-24 shrink-0 overflow-hidden rounded-md bg-surface sm:block">
            {movie.posterUrl && <Image src={movie.posterUrl} alt={movie.title} fill sizes="96px" className="object-cover" />}
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/phim/${movie.slug}`} className="text-lg font-semibold hover:text-brand">
              {movie.title}
            </Link>
            <p className="mt-0.5 text-sm text-muted">
              {[
                movie.originalTitle !== movie.title ? movie.originalTitle : null,
                movie.ageRating,
                runtimeText(movie.runtime),
              ]
                .filter(Boolean)
                .join(" · ")}
              {movie.trailerKey && (
                <>
                  {" · "}
                  <a
                    href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand hover:underline"
                  >
                    Trailer
                  </a>
                </>
              )}
            </p>
            {movie.genres.length > 0 && <p className="text-sm text-muted">{movie.genres.join(", ")}</p>}

            {versions.map(({ label, items }) => (
              <div key={label} className="mt-3">
                <p className="mb-2 text-sm font-semibold">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <ShowtimeButton key={s.id} showtime={s} now={now} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ShowtimeButton({ showtime, now }: { showtime: Showtime; now: number }) {
  const started = new Date(showtime.startAt).getTime() <= now;
  const time = timeOf(showtime.startAt);

  if (started) {
    return (
      <span className="w-[78px] cursor-not-allowed rounded-md bg-surface py-2 text-center text-ink/35" title="Đã qua giờ chiếu">
        <span className="block font-medium">{time}</span>
        <span className="block text-xs">&nbsp;</span>
      </span>
    );
  }
  if (showtime.status !== "ON_SALE") {
    return (
      <span
        className="w-[78px] rounded-md border border-dashed border-line py-2 text-center text-ink/60"
        title="Chưa mở bán"
      >
        <span className="block font-medium">{time}</span>
        <span className="block text-xs">Chưa mở</span>
      </span>
    );
  }
  return (
    <Link
      href={`/dat-ve/${showtime.id}`}
      className="w-[78px] rounded-md border border-ink/25 py-2 text-center transition-colors hover:border-brand hover:bg-brand hover:text-white"
    >
      <span className="block font-semibold">{time}</span>
      <span className="block text-xs opacity-70">{priceShort(showtime.price)}</span>
    </Link>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1].map((i) => (
        <div key={i} className="flex animate-pulse gap-5 rounded-xl bg-white p-5 ring-1 ring-line">
          <div className="h-36 w-24 rounded-md bg-surface" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-1/2 rounded bg-surface" />
            <div className="h-4 w-1/3 rounded bg-surface" />
            <div className="flex gap-2 pt-3">
              <div className="h-12 w-[78px] rounded bg-surface" />
              <div className="h-12 w-[78px] rounded bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

const AVATAR_COLORS = ["#d6203f", "#2a6fdb", "#0f9d74", "#c46a00", "#7c3aed", "#0e7490", "#be185d", "#4d7c0f"];

function ChainAvatar({ name }: { name: string }) {
  const words = name.split(/\s+/);
  const initials = words[0].length <= 3 && words[0] === words[0].toUpperCase() ? words[0] : words.map((w) => w[0]).join("").slice(0, 2);
  const color = AVATAR_COLORS[[...name].reduce((h, ch) => h + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
      style={{ background: color }}
    >
      {initials.toUpperCase()}
    </span>
  );
}

/** Gom rạp theo hãng: hãng nhiều rạp xếp trước, "Rạp độc lập" xếp cuối. */
function groupByChain(list: Cinema[]): [string, Cinema[]][] {
  const map = new Map<string, Cinema[]>();
  for (const c of list) map.set(c.chain, [...(map.get(c.chain) ?? []), c]);
  return [...map.entries()].sort(([a, la], [b, lb]) =>
    a === "Rạp độc lập" ? 1 : b === "Rạp độc lập" ? -1 : lb.length - la.length || a.localeCompare(b, "vi"),
  );
}

/** Gom suất chiếu theo phim, rồi theo phiên bản (định dạng + ngôn ngữ). */
function groupByMovie(showtimes: Showtime[], movies: Movie[]) {
  const movieById = new Map(movies.map((m) => [m.id, m]));
  const result = new Map<number, { movie: Movie; versions: Map<string, Showtime[]> }>();
  for (const s of showtimes) {
    const movie = movieById.get(s.movieId);
    if (!movie) continue;
    const entry = result.get(movie.id) ?? { movie, versions: new Map() };
    const label = versionLabel(s.format, s.language);
    entry.versions.set(label, [...(entry.versions.get(label) ?? []), s]);
    result.set(movie.id, entry);
  }
  return [...result.values()].map(({ movie, versions }) => ({
    movie,
    versions: [...versions.entries()].map(([label, items]) => ({ label, items })),
  }));
}
