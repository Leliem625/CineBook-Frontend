#!/usr/bin/env python3
"""
Xuất dữ liệu THẬT từ database của cinebook-backend ra file mock cho frontend,
để dựng UI trước khi có API. Định dạng JSON giống response API dự kiến (xem src/lib/types.ts).

Yêu cầu: backend đã seed dữ liệu, container postgres đang chạy (docker compose up -d trong cinebook-backend).
Chạy từ thư mục cinebook-frontend:  python3 scripts/export-mock-data.py

Kết quả:
  public/mock/showtimes/{cinemaId}.json   (fetch từ trình duyệt, giả lập GET /cinemas/{id}/showtimes)
Phim, tỉnh/thành, rạp đã lấy từ API backend nên không còn xuất mock. Bỏ script này khi backend có API suất chiếu.
Giá vé là giá giả lập (backend chưa có module pricing).
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT.parent / "cinebook-backend"
SHOWTIMES = ROOT / "public/mock/showtimes"


def query_json(sql: str):
    out = subprocess.run(
        ["docker", "compose", "exec", "-T", "postgres", "psql", "-U", "cinebook", "-d", "cinebook", "-At", "-c", sql],
        cwd=BACKEND, check=True, capture_output=True, text=True).stdout.strip()
    return json.loads(out or "null") or []


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

SHOWTIMES.mkdir(parents=True, exist_ok=True)
for f in SHOWTIMES.glob("*.json"):
    f.unlink()

by_cinema = {}
for s in showtimes:
    by_cinema.setdefault(s.pop("cinemaId"), []).append(s)
for cinema_id, items in by_cinema.items():
    (SHOWTIMES / f"{cinema_id}.json").write_text(
        json.dumps({"cinemaId": cinema_id, "showtimes": items}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8")

print(f"{len(showtimes)} suất chiếu -> {len(by_cinema)} file showtimes")
