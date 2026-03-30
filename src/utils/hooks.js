import { useEffect } from 'react';

/**
 * 팝업/모달 오픈 시 배경 스크롤을 막는 훅
 * @param {boolean} isLocked - 잠금 여부 (기본값 true)
 */
export function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    // 현재 body의 overflow 스타일 저장
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // 스크롤 차단
    document.body.style.overflow = 'hidden';

    // 언마운트 시 혹은 isLocked 변경 시 복구
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}
