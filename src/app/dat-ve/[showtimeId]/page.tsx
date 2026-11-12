import DemoBanner from "@/components/DemoBanner";
import Header from "@/components/Header";
import Link from "next/link";
import { Suspense } from "react";

/** Trang đặt vé (chọn ghế -> combo -> thông tin -> thanh toán). Sẽ làm ở bước sau. */
export default function BookingPage({
  params,
}: PageProps<"/dat-ve/[showtimeId]">) {
  return (
    <>
      <DemoBanner />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Đặt vé</h1>
        <Suspense fallback={<p className="mt-3 text-muted">Đang tải...</p>}>
          <ShowtimeInfo params={params} />
        </Suspense>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          Quay lại chọn suất
        </Link>
      </main>
    </>
  );
}

async function ShowtimeInfo({
  params,
}: {
  params: PageProps<"/dat-ve/[showtimeId]">["params"];
}) {
  const { showtimeId } = await params;
  return (
    <p className="mt-3 text-muted">
      Suất chiếu #{showtimeId}: trang chọn ghế đang được xây dựng.
    </p>
  );
}
