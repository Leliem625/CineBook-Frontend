import BuyByCinema from "@/components/BuyByCinema";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MovieCarousel from "@/components/MovieCarousel";
import { getCinemas, getMovies, getProvinces } from "@/lib/api";

/** Trang "Mua vé": mua theo phim (carousel) + mua theo rạp (khu vực -> rạp -> ngày -> suất). */
export default async function HomePage() {
  const [movies, provinces, cinemas] = await Promise.all([getMovies(), getProvinces(), getCinemas()]);

  return (
    <>
      <DemoBanner />
      <Header />
      <main className="flex-1">
        <MovieCarousel movies={movies} />
        <BuyByCinema provinces={provinces} cinemas={cinemas} movies={movies} />
      </main>
      <Footer movies={movies} cinemas={cinemas} />
    </>
  );
}
