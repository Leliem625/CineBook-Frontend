/**
 * Lớp gọi dữ liệu duy nhất của frontend.
 *
 * Phim, tỉnh/thành, rạp: đã gọi backend thật (cinebook-backend, mặc định http://localhost:8080/api/v1).
 * Kiểu trả về giữ nguyên như lúc dùng mock nên các component không phải sửa.
 *
 * Lưu ý Next.js 16 (cacheComponents): fetch trong server component mặc định KHÔNG cache và sẽ chặn render.
 * - Hiện ĐANG TẮT cache cho phim, tỉnh/thành, rạp: mỗi lần tải trang server Next đều gọi backend.
 *   Trang chủ bọc phần dùng dữ liệu này trong <Suspense> nên vẫn build được.
 * - Bật lại cache cho tỉnh/rạp: bỏ comment "use cache" + cacheLife("hours") (và import cacheLife).
 *   Khi đó dữ liệu được lấy ngay lúc `next build` nên KHI BUILD BACKEND PHẢI ĐANG CHẠY.
 */
// import { cacheLife } from "next/cache";   // bật lại khi dùng lại "use cache"
import { cache } from "react";
import { apiGet } from "./http";
import type { Cinema, Movie, MovieStatus, Province } from "./types";

export { API_BASE } from "./http";

/**
 * GET {API_BASE}/movies[?status=]  -> phim đang chiếu + sắp chiếu.  ✅ ĐÃ NỐI BACKEND THẬT
 * Không truyền status thì lấy cả hai.
 */
export const getMovies = cache(
  async (status?: MovieStatus): Promise<Movie[]> => {
    // "use cache";
    // cacheLife("minutes");
    // React cache(): nhiều component gọi trong CÙNG 1 request -> chỉ gọi backend 1 lần (không cache giữa các request)
    return apiGet<Movie[]>("/movies", { status });
  },
);

/**
 * GET {API_BASE}/provinces  -> 34 tỉnh/thành kèm số cụm rạp, tỉnh nhiều rạp xếp trước.  ✅ ĐÃ NỐI BACKEND THẬT
 */
export async function getProvinces(): Promise<Province[]> {
  // "use cache";
  // cacheLife("hours"); // tỉnh/thành và số rạp gần như không đổi
  return apiGet<Province[]>("/provinces");
}

/**
 * GET {API_BASE}/cinemas[?province=&chain=]  -> cụm rạp đang hoạt động.  ✅ ĐÃ NỐI BACKEND THẬT
 * Không truyền gì thì lấy cả nước (UI tự lọc theo tỉnh, gom theo hãng).
 */
export async function getCinemas(filter?: {
  province?: string;
  chain?: string;
}): Promise<Cinema[]> {
  // "use cache";
  // cacheLife("hours"); // filter là tham số -> mỗi bộ lọc có cache riêng  (ĐANG TẮT để xem request)
  return apiGet<Cinema[]>("/cinemas", filter);
}

/** GET {API_BASE}/cinemas/{id}  -> chi tiết 1 cụm rạp (404 nếu không có).  ✅ ĐÃ NỐI BACKEND THẬT */
export async function getCinema(id: number): Promise<Cinema> {
  return apiGet<Cinema>(`/cinemas/${id}`);
}

// getCinemaShowtimes (gọi từ client) nằm ở ./api-client.ts
