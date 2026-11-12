import type { Language, ScreenFormat } from "./types";

const WEEKDAYS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const WEEKDAYS_LONG = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Ngày hôm nay theo giờ Việt Nam, dạng yyyy-MM-dd. */
export function todayVN(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

/** Cộng ngày cho chuỗi yyyy-MM-dd. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function parts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear(), weekday: d.getUTCDay() };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "12/11" */
export function dayMonth(date: string | null): string {
  if (!date) return "";
  const p = parts(date);
  return `${pad(p.day)}/${pad(p.month)}`;
}

/** "Thứ 5" | "CN" */
export function weekdayShort(date: string): string {
  return WEEKDAYS[parts(date).weekday];
}

/** "Thứ Năm, 12/11/2026" */
export function fullDate(date: string): string {
  const p = parts(date);
  return `${WEEKDAYS_LONG[p.weekday]}, ${pad(p.day)}/${pad(p.month)}/${p.year}`;
}

/** "18:30" từ ISO có offset +07:00 */
export function timeOf(iso: string): string {
  return iso.slice(11, 16);
}

/** 125 -> "2h05'" */
export function runtimeText(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? pad(m) + "'" : ""}` : `${m}'`;
}

/** 65000 -> "65K" */
export function priceShort(vnd: number): string {
  return `${Math.round(vnd / 1000)}K`;
}

const FORMAT_LABEL: Record<ScreenFormat, string> = { F2D: "2D", F3D: "3D", IMAX: "IMAX", F4DX: "4DX" };
const LANGUAGE_LABEL: Record<Language, string> = { SUBTITLED: "Phụ đề", DUBBED: "Lồng tiếng", ORIGINAL: "Tiếng Việt" };

/** "2D Phụ đề" */
export function versionLabel(format: ScreenFormat, language: Language): string {
  return `${FORMAT_LABEL[format]} ${LANGUAGE_LABEL[language]}`;
}
