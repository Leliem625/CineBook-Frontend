/**
 * Hàm gọi dữ liệu dùng trong CLIENT component ("use client").
 * Tách khỏi api.ts vì api.ts dùng "use cache" (chỉ chạy được phía server).
 */
import { apiGet } from "./http";
import type { Movie, MovieStatus, Showtime } from "./types";

/**
 * GET {API_BASE}/movies?status=   ✅ backend thật
 * Bản dùng cho client (đổi tab Đang chiếu / Sắp chiếu). Server component thì dùng getMovies trong api.ts.
 */
export function getMoviesByStatus(status: MovieStatus): Promise<Movie[]> {
  // Đã có request cho status này (đang chạy hoặc đã xong) -> dùng lại, không gọi API lần nữa.
  // Nhờ vậy dev (React Strict Mode chạy effect 2 lần) cũng chỉ gọi 1 lần, và đổi qua lại tab không gọi lại.
  let promise = moviesByStatus.get(status);
  if (!promise) {
    promise = apiGet<Movie[]>("/movies", { status });
    // Lỗi thì xoá khỏi cache để lần sau gọi lại được.
    promise.catch(() => moviesByStatus.delete(status));
    moviesByStatus.set(status, promise);
  }
  return promise;
}

/** Cache trong bộ nhớ trình duyệt, mất khi tải lại trang (F5). */
const moviesByStatus = new Map<MovieStatus, Promise<Movie[]>>();

/**
 * GET {API_BASE}/cinemas/{cinemaId}/showtimes?date=yyyy-MM-dd   (backend chưa có -> đang đọc mock)
 * Gọi từ client component (khi người dùng chọn rạp / ngày).
 */
export async function getCinemaShowtimes(cinemaId: number, date: string): Promise<Showtime[]> {
  const res = await fetch(`/mock/showtimes/${cinemaId}.json`);
  if (!res.ok) {
    return [];
  }
  const body: { showtimes: Showtime[] } = await res.json();
  return body.showtimes.filter((s) => s.startAt.startsWith(date));
}
