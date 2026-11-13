import { useSyncExternalStore } from "react";
import { todayVN } from "./format";

/** Số ms còn lại đến 00:00 ngày kế tiếp theo giờ VN (VN không có giờ mùa hè, luôn UTC+7). */
function msUntilNextMidnightVN(): number {
  const VN_OFFSET = 7 * 3600_000;
  const DAY = 24 * 3600_000;
  return DAY - ((Date.now() + VN_OFFSET) % DAY);
}

/**
 * Báo cho React tính lại "hôm nay" khi: sang ngày mới (00:00 giờ VN),
 * hoặc người dùng quay lại tab (máy ngủ / tab nền làm timer bị trễ).
 */
function subscribe(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, msUntilNextMidnightVN() + 500); // +500ms để chắc chắn đã qua 0h
  };
  schedule();

  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/**
 * Ngày hôm nay (giờ VN, yyyy-MM-dd) chỉ tính ở trình duyệt, tự đổi khi sang ngày mới.
 * Trên server / lúc prerender trả về null, tránh lệch nội dung khi hydrate
 * (trang được prerender sẵn nên "hôm nay" lúc build khác "hôm nay" lúc người dùng mở).
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayVN, () => null);
}
