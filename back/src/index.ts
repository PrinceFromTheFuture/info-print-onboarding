import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./trpc/trpc.js";
import cors from "cors";
import { appRouter } from "./trpc/index.js";
import cookieParser from "cookie-parser";
import { getPayload } from "./db/getPayload.js";
import multer from "multer";

import path from "path";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// IMPORTANT: Apply CORS and cookie parser first
app.use(
  cors({
    origin: ["http://localhost:3000", "http://100.125.142.120:3000", "https://infoprint-onboarding.amirwais.store"], // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(cookieParser());

const port = 3005;

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 50MB limit
  },
});

// IMPORTANT: Upload route MUST come before auth and other routes
// to prevent body parsers from consuming the request
app.post(
  "/api/media/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const payload = await getPayload;

      const authRes = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const userId = authRes?.user?.id;

      // Check if file is present in the request
      if (!req.file) {
        return res.status(400).json({
          error: "No file provided",
          debug: {
            contentType: req.headers["content-type"],
            bodyKeys: Object.keys(req.body || {}),
            bodyFileType: req.body?.file ? typeof req.body.file : "N/A",
          },
        });
      }

      const { alt } = req.body;

      console.log("File info:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(req.file.originalname || "file");
      const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`;

      // Create a file object that Payload expects
      // Payload expects a File-like object with specific properties
      const fileObject = {
        data: req.file.buffer,
        mimetype: req.file.mimetype,
        name: req.file.originalname,
        size: req.file.size,
      };

      console.log("Creating media record with:", {
        alt: alt || "",
        uploadedBy: userId || undefined,
        extention: fileExtension,
        fileObject: {
          name: fileObject.name,
          mimetype: fileObject.mimetype,
          size: fileObject.size,
        },
      });

      // Create media record in Payload with the user's ID
      const mediaRecord = await payload.create({
        collection: "media",
        data: {
          alt: alt || "",
          uploadedBy: userId,
          extention: fileExtension,
        },
        file: fileObject,
      });

      console.log("Media record created:", mediaRecord.id);

      // Get the actual filename that Payload saved
      const savedFilename = mediaRecord.filename || uniqueFileName;

      // Return the file URL using the filename from Payload

      res.json({
        success: true,
        serverFileUrl: mediaRecord.url,
        mediaId: mediaRecord.id,
        filename: savedFilename,
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({
        error: "Failed to upload media file",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
);

// Add auth and static routes after upload
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/media/file", express.static("media"));

// Add JSON and URL-encoded body parsers AFTER the upload route
// to prevent them from interfering with multipart form data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(port, "0.0.0.0", () => {
  const procedureList = Object.keys(appRouter._def.procedures);
  console.log(procedureList);
  console.log(`Example app listening on port ${port}`);
});
