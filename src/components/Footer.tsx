import Link from "next/link";
import type { Cinema, Movie } from "@/lib/types";
import { TicketLogo } from "./icons";

export default function Footer({ movies, cinemas }: { movies: Movie[]; cinemas: Cinema[] }) {
  const vietnameseUpcoming = movies.filter((m) => m.vietnamese && m.status === "COMING_SOON").slice(0, 9);
  const chains = [...new Set(cinemas.map((c) => c.chain))].filter((c) => c !== "Rạp độc lập").sort();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          {vietnameseUpcoming.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">Phim Việt sắp chiếu</h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {vietnameseUpcoming.map((m) => (
                  <li key={m.id}>
                    <Link href={`/phim/${m.slug}`} className="text-ink/75 hover:text-brand">
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <TicketLogo className="h-12 w-12 shrink-0 text-brand" />
            <div className="space-y-1 text-sm text-muted">
              <p className="font-semibold text-ink">CineBook - dự án học tập</p>
              <p>Website demo lịch chiếu và đặt vé. Không bán vé thật, thanh toán chỉ ở chế độ thử nghiệm.</p>
              <p>
                <Link href="/gioi-thieu" className="hover:text-brand">Giới thiệu</Link> ·{" "}
                <Link href="/chinh-sach" className="hover:text-brand">Chính sách</Link> ·{" "}
                <Link href="/ho-tro" className="hover:text-brand">Hỗ trợ</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">Hệ thống rạp</h3>
            <div className="flex flex-wrap gap-2">
              {chains.map((c) => (
                <span key={c} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink/75 ring-1 ring-line">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1 text-xs leading-relaxed text-muted">
            <p className="font-semibold text-ink/70">Nguồn dữ liệu</p>
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
            <p>Dữ liệu rạp: © OpenStreetMap contributors (ODbL) · Overture Maps Foundation.</p>
            <p>Tên và thương hiệu rạp thuộc về chủ sở hữu tương ứng.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
