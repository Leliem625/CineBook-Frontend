import Link from "next/link";
import { HelpIcon, PinIcon, SearchIcon, TicketLogo } from "./icons";

const NAV = [
  { href: "/", label: "Đặt vé", active: true },
  { href: "/lich-chieu", label: "Lịch chiếu" },
  { href: "/phim", label: "Phim" },
  { href: "/rap", label: "Rạp" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-brand">
          <TicketLogo className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">
            Cine<span className="text-ink">Book</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.active ? "text-brand" : "text-ink/80 hover:bg-surface hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="hidden h-10 w-64 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted focus-within:border-brand sm:flex">
            <SearchIcon className="h-4 w-4 shrink-0" />
            <input
              type="search"
              placeholder="Tìm phim, rạp..."
              className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>
          <button
            type="button"
            aria-label="Chọn khu vực"
            className="grid h-10 w-10 place-items-center rounded-full text-ink/70 hover:bg-surface"
          >
            <PinIcon className="h-5 w-5" />
          </button>
          <Link
            href="/ho-tro"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink/80 hover:bg-surface md:flex"
          >
            <HelpIcon className="h-5 w-5" /> Hỗ trợ
          </Link>
        </div>
      </div>
    </header>
  );
}
