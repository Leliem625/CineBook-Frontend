import { Suspense } from "react";
import BuyByCinema from "@/components/BuyByCinema";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MovieCarousel from "@/components/MovieCarousel";
import { getCinemas, getMovies, getProvinces } from "@/lib/api";

/**
 * Trang "Mua vé": mua theo phim (carousel) + mua theo rạp (khu vực -> rạp -> ngày -> suất).
 *
 * Next 16 (cacheComponents): phần tĩnh (Header, carousel) được prerender và hiện ngay;
 * phần cần dữ liệu phim (chưa cache) nằm trong <Suspense> và được stream về khi có dữ liệu.
 */
export default function HomePage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main className="flex-1">
        <MovieCarousel />
        <Suspense fallback={<BuyByCinemaSkeleton />}>
          <BuyByCinemaSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <FooterSection />
      </Suspense>
    </>
  );
}

async function BuyByCinemaSection() {
  const [provinces, cinemas] = await Promise.all([getProvinces(), getCinemas()]);
  return <BuyByCinema provinces={provinces} cinemas={cinemas} />;
}

async function FooterSection() {
  // getMovies được bọc React cache(): cùng 1 request chỉ gọi backend 1 lần dù 2 chỗ dùng
  const [movies, cinemas] = await Promise.all([getMovies(), getCinemas()]);
  return <Footer movies={movies} cinemas={cinemas} />;
}

function BuyByCinemaSkeleton() {
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-12">
        <div className="mx-auto mb-8 h-8 w-56 rounded bg-white" />
        <div className="grid gap-5 lg:grid-cols-[250px_290px_1fr]">
          <div className="h-96 rounded-xl bg-white" />
          <div className="h-96 rounded-xl bg-white" />
          <div className="h-96 rounded-xl bg-white" />
        </div>
      </div>
    </section>
  );
}
