import { useEffect } from "react";

/**
 * 페이지 타이틀(document.title)을 변경하는 커스텀 훅
 * @param {string} title 설정할 타이틀 문자열
 */
export default function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
}
