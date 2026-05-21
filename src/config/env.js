function isPlaceholderValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return (
    !normalized ||
    normalized.startsWith("your_") ||
    normalized.startsWith("change_") ||
    normalized.startsWith("replace_") ||
    normalized.startsWith("example_") ||
    normalized.startsWith("<") ||
    normalized.endsWith("_here")
  );
}

function readSentryDsn() {
  const rawValue = import.meta.env.SENTRY_DSN;
  if (isPlaceholderValue(rawValue)) {
    return "";
  }

  return String(rawValue).trim();
}

export const appEnv = import.meta.env.APP_ENV || "local";
export const sentryDsn = readSentryDsn();
export const hasValidSentryDsn = Boolean(sentryDsn);

export const env = {
  appEnv,
  sentryDsn,
  hasValidSentryDsn,
  isLocal: appEnv === "local",
  isDev: appEnv === "dev",
  isProd: appEnv === "prod",
};
