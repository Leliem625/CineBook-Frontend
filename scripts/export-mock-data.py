#!/usr/bin/env python3
"""
Xuất dữ liệu THẬT từ database của cinebook-backend ra file mock cho frontend,
để dựng UI trước khi có API. Định dạng JSON giống response API dự kiến (xem src/lib/types.ts).

Yêu cầu: backend đã seed dữ liệu, container postgres đang chạy (docker compose up -d trong cinebook-backend).
Chạy từ thư mục cinebook-frontend:  python3 scripts/export-mock-data.py

Kết quả:
  src/mocks/movies.json, provinces.json, cinemas.json   (import trực tiếp, dùng ở server component)
  public/mock/showtimes/{cinemaId}.json                 (fetch từ trình duyệt, giả lập GET /cinemas/{id}/showtimes)
Giá vé là giá giả lập (backend chưa có module pricing).
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT.parent / "cinebook-backend"
MOCKS = ROOT / "src/mocks"
SHOWTIMES = ROOT / "public/mock/showtimes"


def query_json(sql: str):
    out = subprocess.run(
        ["docker", "compose", "exec", "-T", "postgres", "psql", "-U", "cinebook", "-d", "cinebook", "-At", "-c", sql],
        cwd=BACKEND, check=True, capture_output=True, text=True).stdout.strip()
    return json.loads(out or "null") or []


movies = query_json("""
SELECT json_agg(x ORDER BY x."status" DESC, x."popularity" DESC) FROM (
  SELECT m.id, m.tmdb_id AS "tmdbId", m.slug, m.title_vi AS title, m.original_title AS "originalTitle",
         m.poster_url AS "posterUrl", m.release_date_vn AS "releaseDate", m.age_rating AS "ageRating",
         m.runtime_min AS runtime, m.tmdb_score AS score, m.trailer_key AS "trailerKey", m.status,
         coalesce(m.country LIKE '%VN%', false) AS vietnamese, m.tmdb_popularity AS popularity,
         coalesce((SELECT json_agg(g.name ORDER BY g.name) FROM movie_genre mg JOIN genre g ON g.id = mg.genre_id
                   WHERE mg.movie_id = m.id), '[]') AS genres
  FROM movie m) x
""")
for m in movies:
    m.pop("popularity", None)

provinces = query_json("""
SELECT json_agg(x ORDER BY x."cinemaCount" DESC, x.name) FROM (
  SELECT p.slug, p.name, count(c.id) AS "cinemaCount"
  FROM province p LEFT JOIN cinema c ON c.province_id = p.id AND c.active
  GROUP BY p.id) x
""")

cinemas = query_json("""
SELECT json_agg(x ORDER BY x.chain = 'Rạp độc lập', x.chain, x.name) FROM (
  SELECT c.id, c.name, ch.name AS chain, ch.slug AS "chainSlug", p.slug AS "provinceSlug",
         c.address, c.latitude::float AS lat, c.longitude::float AS lng
  FROM cinema c JOIN cinema_chain ch ON ch.id = c.chain_id JOIN province p ON p.id = c.province_id
  WHERE c.active) x
""")

# Giá giả lập: theo định dạng, suất sáng rẻ hơn, cuối tuần đắt hơn
showtimes = query_json("""
SELECT json_agg(x ORDER BY x."cinemaId", x."startAt") FROM (
  SELECT s.id, s.cinema_id AS "cinemaId", s.movie_id AS "movieId",
         to_char(s.start_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD"T"HH24:MI:SS"+07:00"') AS "startAt",
         s.format, s.language, s.status,
         (CASE s.format WHEN 'IMAX' THEN 120000 WHEN 'F3D' THEN 85000 ELSE 65000 END
          - CASE WHEN extract(hour FROM s.start_at AT TIME ZONE 'Asia/Ho_Chi_Minh') < 12 THEN 15000 ELSE 0 END
          + CASE WHEN extract(isodow FROM s.start_at AT TIME ZONE 'Asia/Ho_Chi_Minh') >= 6 THEN 10000 ELSE 0 END
         ) AS price
  FROM showtime s WHERE s.status IN ('ON_SALE', 'SCHEDULED')) x
""")

MOCKS.mkdir(parents=True, exist_ok=True)
SHOWTIMES.mkdir(parents=True, exist_ok=True)
for f in SHOWTIMES.glob("*.json"):
    f.unlink()
(MOCKS / "movies.json").write_text(json.dumps(movies, ensure_ascii=False, indent=1), encoding="utf-8")
(MOCKS / "provinces.json").write_text(json.dumps(provinces, ensure_ascii=False, indent=1), encoding="utf-8")
(MOCKS / "cinemas.json").write_text(json.dumps(cinemas, ensure_ascii=False), encoding="utf-8")

by_cinema = {}
for s in showtimes:
    by_cinema.setdefault(s.pop("cinemaId"), []).append(s)
for cinema_id, items in by_cinema.items():
    (SHOWTIMES / f"{cinema_id}.json").write_text(
        json.dumps({"cinemaId": cinema_id, "showtimes": items}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8")

print(f"{len(movies)} phim, {len(provinces)} tỉnh, {len(cinemas)} rạp, "
      f"{len(showtimes)} suất chiếu -> {len(by_cinema)} file showtimes")
