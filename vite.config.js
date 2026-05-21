import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function resolveAppEnv(mode) {
  const normalized = (process.env.APP_ENV || mode || "local").toLowerCase();
  if (normalized === "dev" || normalized === "development") {
    return "dev";
  }
  if (normalized === "prod" || normalized === "production") {
    return "prod";
  }
  return "local";
}

function getEnvFileName(appEnv) {
  if (appEnv === "dev") {
    return ".env.development";
  }
  if (appEnv === "prod") {
    return ".env.production";
  }
  return ".env.local";
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/u)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function getEnvValue(key, fileEnv) {
  return process.env[key] || fileEnv[key] || "";
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const appEnv = resolveAppEnv(mode);
  const envFilePath = resolve(process.cwd(), getEnvFileName(appEnv));
  const appEnvValues = parseEnvFile(envFilePath);

  return {
    define: {
      "import.meta.env.APP_ENV": JSON.stringify(getEnvValue("APP_ENV", appEnvValues) || appEnv),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(getEnvValue("VITE_API_BASE_URL", appEnvValues)),
      "import.meta.env.SENTRY_DSN": JSON.stringify(getEnvValue("SENTRY_DSN", appEnvValues)),
    },
    plugins: [
      react(),
      {
        name: "force-charset",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // HTML 및 문서 요청에 대해 명시적으로 UTF-8 인코딩을 강제 지정합니다.
            if (
              req.url === "/" ||
              req.url.endsWith(".html") ||
              req.headers.accept?.includes("text/html")
            ) {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
            }
            next();
          });
        },
      },
    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
  };
});
