const path = require("path");
const express = require("express");
const app = express();

// 设置静态资源目录
app.use(express.static(path.join(__dirname, "../public")));

// 监听端口
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
