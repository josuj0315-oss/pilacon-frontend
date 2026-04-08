export const ReportTargetType = {
  JOB: 'JOB',
  USER: 'USER',
};

export const ReportReasonCode = {
  FALSE_INFO: 'FALSE_INFO',     // 허위 정보 또는 사기 의심
  SPAM: 'SPAM',                 // 광고/홍보/도배
  OFFENSIVE: 'OFFENSIVE',       // 욕설/비하/불쾌한 표현
  INAPPROPRIATE: 'INAPPROPRIATE', // 부적절한 구인 내용
  DUPLICATE: 'DUPLICATE',       // 중복 게시물
  OTHER: 'OTHER',               // 기타
};

export const ReportReasonLabels = {
  FALSE_INFO: '허위 정보 또는 사기 의심',
  SPAM: '광고/홍보/도배',
  OFFENSIVE: '욕설/비하/불쾌한 표현',
  INAPPROPRIATE: '부적절한 구인 내용',
  DUPLICATE: '중복 게시물',
  OTHER: '기타 (직접 입력)',
};

export const ReportStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
};

export const ReportStatusLabels = {
  PENDING: '대기 중',
  REVIEWING: '검토 중',
  RESOLVED: '처리 완료',
  DISMISSED: '기각됨',
};

export const ReportStatusColors = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  REVIEWING: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  RESOLVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  DISMISSED: 'bg-gray-50 text-gray-400 border-gray-200',
};

export const ReportActionResult = {
  NONE: 'NONE',
  POST_HIDDEN: 'POST_HIDDEN',
  POST_DELETED: 'POST_DELETED',
  USER_WARNED: 'USER_WARNED',
  USER_SUSPENDED: 'USER_SUSPENDED',
};

export const ReportActionResultLabels = {
  NONE: '조치 없음',
  POST_HIDDEN: '게시물 숨김',
  POST_DELETED: '게시물 삭제',
  USER_WARNED: '사용자 경고',
  USER_SUSPENDED: '사용자 정지',
};
