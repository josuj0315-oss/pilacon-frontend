export const LOGIN_NEXT_STORAGE_KEY = "fitjob:login_next";

export const normalizeAuthNextPath = (value) => {
  if (!value || typeof value !== "string") return "";

  const nextPath = value.trim();
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return "";
  if (nextPath === "/login" || nextPath.startsWith("/login?")) return "";

  return nextPath;
};

export const getPostLoginPath = (user, fallbackPath, getOnboardingPath) => {
  const onboardingPath = getOnboardingPath(user);
  if (onboardingPath !== "/") return onboardingPath;

  return normalizeAuthNextPath(fallbackPath) || onboardingPath;
};
