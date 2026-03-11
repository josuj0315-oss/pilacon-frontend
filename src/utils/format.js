// src/utils/format.js

/**
 * 숫자/문자열 어떤 pay가 와도 "30,000원"으로 포맷
 * - pay가 0/비어있으면 빈 문자열 반환
 */
export function formatPayKRW(pay) {
  const n =
    typeof pay === "number"
      ? pay
      : Number(String(pay ?? "").replace(/\D/g, ""));

  if (!n) return "";
  return n.toLocaleString("ko-KR") + "원";
}
