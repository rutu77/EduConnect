import cors from "cors";
import express from "express";
import path from "path";
import { AppDataSource } from "./config/database";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { userRoutes } from "./routes/userRoutes";
import { courseRoutes } from "./routes/courseRoutes";
import { lessonRoutes } from "./routes/lessonRoutes";
import { commentRoutes } from "./routes/commentRoutes";
import { quizRoutes } from "./routes/quizRoutes";
import { enrollRoutes } from "./routes/enrollmentRoutes";
// import { categoryRoutes } from "./routes/categoryRoutes";
import { questionRoutes } from "./routes/questionRoutes";
import { reviewRoutes } from "./routes/reviewRoutes";
import { progressRoutes } from "./routes/progressRoutes";
import { aiRoutes } from "./routes/aiRoutes";
import { createReadinessHandler, healthRoutes } from "./routes/healthRoutes";
import { errorMiddleware } from "./middleware/error-middleware";
import { httpSecurityHeaders } from "./middleware/httpSecurity";

const app = express();
app.set("trust proxy", env.trustProxyHops);
app.disable("x-powered-by");

app.use(httpSecurityHeaders);
app.use(
  cors({
    origin: env.corsOrigins,
    allowedHeaders: ["Content-type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/health", healthRoutes);
app.get(
  "/health/ready",
  createReadinessHandler(() => AppDataSource.query("SELECT 1"))
);

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/course", courseRoutes);
// app.use('/category',categoryRoutes)
app.use("/lesson", lessonRoutes);
app.use("/comment", commentRoutes);
app.use("/quiz", quizRoutes);
app.use("/enrollment", enrollRoutes);
app.use("/review", reviewRoutes);
app.use("/question", questionRoutes);
app.use("/progress", progressRoutes);
app.use("/ai", aiRoutes);
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});
app.use(errorMiddleware);

async function startServer(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      resolve();
    });
    server.once("error", reject);
  });
}

startServer().catch(async (error: unknown) => {
  console.error("Backend startup failed:", error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exitCode = 1;
});
