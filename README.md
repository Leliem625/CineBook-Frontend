# CineBook Frontend

Frontend Next.js 16 (App Router, TypeScript, Tailwind CSS v4) cho CineBook, website lịch chiếu và đặt vé xem phim.
Backend: repo `cinebook-backend` (Spring Boot). Đặc tả: `docs/CineBook_SRS_v1.1.pdf` trong repo backend.

## Chạy
```bash
npm install
npm run dev     # http://localhost:3000 - cần backend chạy ở http://localhost:8080
npm run build   # cần backend ĐANG CHẠY: dữ liệu "use cache" được lấy lúc build
```

## Cấu trúc
```
src/
├── app/
│   ├── page.tsx                  Trang "Mua vé": theo phim + theo rạp
│   └── dat-ve/[showtimeId]/      Trang đặt vé (đang làm)
├── components/
│   ├── Header, Footer, DemoBanner
│   ├── MovieCarousel.tsx         Carousel phim đang chiếu / sắp chiếu
│   └── BuyByCinema.tsx           Khu vực -> Rạp (gom theo hãng) -> Ngày -> Suất chiếu
├── lib/
│   ├── api.ts                    ⭐ Nơi lấy dữ liệu từ backend (server component)
│   ├── types.ts                  Kiểu dữ liệu = response API dự kiến
│   ├── format.ts                 Định dạng ngày, giờ, giá, phiên bản (2D Phụ đề...)
│   └── useToday.ts               Ngày hôm nay (chỉ tính ở trình duyệt)
```

## API backend đang dùng
Dữ liệu lấy qua `src/lib/api.ts` (server) và `src/lib/api-client.ts` (client), mỗi hàm đã ghi endpoint tương ứng:

| Hàm | Endpoint backend |
|---|---|
| `getMovies()` | `GET /api/v1/movies` |
| `getProvinces()` | `GET /api/v1/provinces` |
| `getCinemas()` | `GET /api/v1/cinemas` |
| `getCinemaShowtimes(id, date)` (trong `api-client.ts`) | `GET /api/v1/showtimes?cinema={id}&date=yyyy-MM-dd` |

Giữ đúng kiểu trong `types.ts` thì component không phải sửa. Next 16 bật `cacheComponents`:
fetch trong server component không tự cache, nên dùng `"use cache"` cho dữ liệu ít đổi hoặc bọc `<Suspense>`.
Đặt `NEXT_PUBLIC_API_BASE` trong `.env.local` nếu backend không ở `http://localhost:8080/api/v1`.

## Ghi nguồn (bắt buộc)
TMDB (dữ liệu phim), © OpenStreetMap contributors và Overture Maps (dữ liệu rạp), đã có ở Footer.
