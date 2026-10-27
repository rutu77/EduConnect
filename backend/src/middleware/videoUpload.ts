import fs from "fs";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const videoExtensions: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    const extension = videoExtensions[file.mimetype];
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `lesson-video-${uniqueSuffix}${extension}`);
  },
});

export const videoUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!videoExtensions[file.mimetype]) {
      callback(new AppError("Only MP4 and WebM video uploads are accepted", 400));
      return;
    }
    callback(null, true);
  },
});
