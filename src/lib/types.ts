/**
 * Kiểu dữ liệu dùng chung, khớp với response API dự kiến của cinebook-backend.
 * Khi viết API ở backend, giữ đúng các tên trường này thì UI không phải sửa.
 */

export type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED";
export type AgeRating = "P" | "K" | "T13" | "T16" | "T18";
export type ScreenFormat = "F2D" | "F3D" | "IMAX" | "F4DX";
export type Language = "SUBTITLED" | "DUBBED" | "ORIGINAL";
export type ShowtimeStatus = "SCHEDULED" | "ON_SALE" | "CLOSED" | "FINISHED" | "CANCELLED";

/** GET /api/v1/movies */
export interface Movie {
  id: number;
  tmdbId: number;
  slug: string;
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  releaseDate: string | null; // yyyy-MM-dd
  ageRating: AgeRating | null;
  runtime: number | null; // phút
  score: number | null; // điểm TMDB 0-10
  trailerKey: string | null; // YouTube key
  status: MovieStatus;
  vietnamese: boolean;
  genres: string[];
}

/** GET /api/v1/provinces */
export interface Province {
  slug: string;
  name: string;
  cinemaCount: number;
}

/** GET /api/v1/cinemas?province= */
export interface Cinema {
  id: number;
  name: string;
  chain: string;
  chainSlug: string;
  provinceSlug: string;
  provinceName?: string;
  address: string;
  phone?: string | null;
  lat: number | null;
  lng: number | null;
}

/** Một suất chiếu trong GET /api/v1/cinemas/{id}/showtimes?date= */
export interface Showtime {
  id: number;
  movieId: number;
  startAt: string; // ISO 8601, giờ VN (+07:00)
  format: ScreenFormat;
  language: Language;
  status: ShowtimeStatus;
  price: number; // VND
}
