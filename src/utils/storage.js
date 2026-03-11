// src/utils/storage.js
const PREFIX = "pilacon:v1:";

export const storageKeys = {
  jobs: `${PREFIX}jobs`,
  activity: `${PREFIX}activity`, // 내활동(지원 기록)
  chats: `${PREFIX}chats`,       // 채팅(나중에 4번에서 씀)
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode 등일 때도 앱이 죽지 않게
  }
}
