import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./trpc/trpc";
import cors from "cors";
import { appRouter } from "./trpc";
import cookieParser from "cookie-parser";
import { getPayload } from "./db/getPayload";
import fs from "fs";
import path from "path";
const app = express();
app.use(cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
const port = 3005;
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/media/file", express.static("media"));
// Media upload endpoint
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.post("/api/media/upload", async (req, res) => {
    try {
        const payload = await getPayload;
        // Check if file data is present in the request
        if (!req.body || !req.body.fileData) {
            return res.status(400).json({ error: "No file data provided" });
        }
        const { fileData, fileName, alt, uploadedBy } = req.body;
        // Decode base64 file data
        const fileBuffer = Buffer.from(fileData, "base64");
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(fileName || "file");
        const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`;
        const filePath = path.join("media", uniqueFileName);
        // Ensure media directory exists
        if (!fs.existsSync("media")) {
            fs.mkdirSync("media", { recursive: true });
        }
        // Write file to disk
        fs.writeFileSync(filePath, fileBuffer);
        // Create media record in Payload
        const mediaRecord = await payload.create({
            collection: "media",
            data: {
                filename: uniqueFileName,
                alt: alt || "",
                uploadedBy: uploadedBy || null,
                extention: fileExtension,
            },
        });
        // Return the file URL
        const fileUrl = `${req.protocol}://${req.get("host")}/api/media/file/${uniqueFileName}`;
        res.json({
            success: true,
            fileUrl,
            mediaId: mediaRecord.id,
            filename: uniqueFileName,
        });
    }
    catch (error) {
        console.error("Error uploading media:", error);
        res.status(500).json({
            error: "Failed to upload media file",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
app.use("/trpc", createExpressMiddleware({
    router: appRouter,
    createContext,
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
