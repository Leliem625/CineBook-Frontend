import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Dev: in ra terminal mọi fetch phía server (Server Component gọi backend không hiện ở tab Network của trình duyệt)
  logging: {
    fetches: { fullUrl: true, hmrRefreshes: true },
  },
  images: {
    // Poster phim từ TMDB (image.tmdb.org không bị chặn ở VN, chỉ api.themoviedb.org bị chặn)
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  reactStrictMode: false,
};

export default nextConfig;
