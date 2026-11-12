import { useSyncExternalStore } from "react";
import { todayVN } from "./format";

const noopSubscribe = () => () => {};

/**
 * Ngày hôm nay (giờ VN, yyyy-MM-dd) chỉ tính ở trình duyệt.
 * Trên server / lúc prerender trả về null, tránh lệch nội dung khi hydrate
 * (trang được prerender sẵn nên "hôm nay" lúc build khác "hôm nay" lúc người dùng mở).
 */
export function useToday(): string | null {
  return useSyncExternalStore(noopSubscribe, todayVN, () => null);
}
