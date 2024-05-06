import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { ErrorMidleware } from "./erorr-middleware";
dotenv.config();
import path from "path";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../uploads")));
// Definition Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
app.use(
  multer({
    storage: storage, // can using "dest" or "storage"
    limits: { fileSize: 15728640 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "video/mp4" || file.mimetype === "video/webm") {
        cb(null, true);
      } else {
        cb(new Error("Only .mp4 and .webm format allowed!"));
      }
    },
  }).single("file")
);

app.post("/api/upload", (req, res) => {
  res.json({
    data: req.file,
  });
});

app.get("/api/video", (req, res) => {
  const filePath: string = path.resolve(
    __dirname,
    "../uploads/" + req.query.name
  );
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/webm",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/webm",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.use(ErrorMidleware.MulterErrorMiddleware);
app.listen(process.env.APP_PORT, () => {
  console.log(`App Listen On Port ${process.env.APP_PORT}`);
});
