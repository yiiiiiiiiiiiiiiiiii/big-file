const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD"],
  })
);

app.use(express.static("public"));

// 下载文件
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../xlsx", filename);

  if (!fs.existsSync(filePath)) {
    // 不存在则返回 404
    res.status(404).send("File not found");
    return;
  }

  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
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
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`, // 建议浏览器将文件作为附件下载
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`, // 建议浏览器将文件作为附件下载
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.head("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../xlsx", filename);

  // 不存在则返回 404
  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found");
    return;
  }

  const fileStats = fs.statSync(filePath);

  // 设置响应头
  res.set({
    "Content-Length": fileStats.size,
    "Accept-Ranges": "bytes", // 表示服务器支持范围请求
  });

  // 结束响应（不发送任何内容）
  res.end();
});

// 启动服务
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
