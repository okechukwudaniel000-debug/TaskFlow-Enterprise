import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./src/backend/routes";
import { errorMiddleware } from "./src/backend/middleware/errorMiddleware";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express parser middlewares (Must precede routes)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount central REST API router
  app.use("/api", apiRouter);

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Global Express error handler
  app.use(errorMiddleware);

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production server. Serving static files from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Development App URL: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot Enterprise SaaS Platform server:", err);
});
