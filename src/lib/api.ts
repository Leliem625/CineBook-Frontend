/**
 * Lớp gọi dữ liệu duy nhất của frontend.
 *
 * Hiện tại đọc dữ liệu MOCK (xuất từ DB thật bằng scripts/export-mock-data.py).
 * Khi backend có API: thay phần thân mỗi hàm bằng fetch tới API_BASE (endpoint ghi ở từng hàm),
 * các component không cần sửa vì kiểu trả về giữ nguyên.
 *
 * Lưu ý Next.js 16 (cacheComponents): fetch trong server component mặc định KHÔNG cache và sẽ chặn render.
 * Khi đổi sang API thật, dùng directive "use cache" cho dữ liệu ít đổi (phim, tỉnh, rạp),
 * hoặc bọc component trong <Suspense>.
 */
import moviesMock from "@/mocks/movies.json";
import provincesMock from "@/mocks/provinces.json";
import cinemasMock from "@/mocks/cinemas.json";
import type { Cinema, Movie, Province, Showtime } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";

/** GET {API_BASE}/movies  -> phim đang chiếu + sắp chiếu */
export async function getMovies(): Promise<Movie[]> {
  return moviesMock as Movie[];
}

/** GET {API_BASE}/provinces  -> 34 tỉnh/thành kèm số cụm rạp */
export async function getProvinces(): Promise<Province[]> {
  return provincesMock as Province[];
}

/** GET {API_BASE}/cinemas  -> toàn bộ cụm rạp (UI tự lọc theo tỉnh, gom theo hãng) */
export async function getCinemas(): Promise<Cinema[]> {
  return cinemasMock as Cinema[];
}

/**
 * GET {API_BASE}/cinemas/{cinemaId}/showtimes?date=yyyy-MM-dd
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
