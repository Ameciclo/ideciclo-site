import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { pathToFileURL } from "url";
import { componentTagger } from "lovable-tagger";

type MiddlewareRequest = {
  url?: string;
};

type MiddlewareResponse = unknown;
type MiddlewareNext = (error?: unknown) => void;
type Middleware = (
  request: MiddlewareRequest,
  response: MiddlewareResponse,
  next: MiddlewareNext
) => Promise<void>;
type MiddlewareServer = {
  middlewares: {
    use: (middleware: Middleware) => void;
  };
};

const createApiMiddleware = () => {
  const routeModules = [
    {
      prefix: "/api/auth",
      modulePath: path.resolve(__dirname, "./api/auth/[...route].js"),
    },
    {
      prefix: "/api/db",
      modulePath: path.resolve(__dirname, "./api/db/[...route].js"),
    },
  ];

  return async (request: MiddlewareRequest, response: MiddlewareResponse, next: MiddlewareNext) => {
    const requestUrl = request.url || "/";
    const matchedRoute = routeModules.find(
      ({ prefix }) => requestUrl === prefix || requestUrl.startsWith(`${prefix}/`)
    );

    if (!matchedRoute) {
      next();
      return;
    }

    try {
      const handlerModule = await import(pathToFileURL(matchedRoute.modulePath).href);
      await handlerModule.default(request, response);
    } catch (error) {
      next(error);
    }
  };
};

const localApiRoutes = () => {
  const middleware = createApiMiddleware();

  return {
    name: "local-api-routes",
    configureServer(server: MiddlewareServer) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: MiddlewareServer) {
      server.middlewares.use(middleware);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    localApiRoutes(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
