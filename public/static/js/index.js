document.getElementById("downloadBtn").addEventListener("click", async () => {
  const url = "http://localhost:3001/download/chengdu_weather.xlsx";
  const fileName = "chengdu_weather.xlsx";

  const downloader = new FileDownloader({
    url,
    fileName,
    begin: () => {
      document.getElementById("progressBar").value = 0;
      document.getElementById("status").textContent = `已下载: ${0}%`;
    },
    progress: ({ loaded, total }) => {
      const progress = Math.floor((loaded / total) * 100);
      document.getElementById("progressBar").value = progress;
      document.getElementById("status").textContent = `已下载: ${progress}%`;
    },
    success: ({ status }) => {
      console.log(`下载成功：${status}%`);
    },
  });
  // 开始下载
  downloader.startDownload();

  // 取消下载
  // downloader.cancelDownload();
});

document.getElementById("streamBtn").addEventListener("click", async () => {
  const url = "http://localhost:3001/stream/chengdu_weather.xlsx";
  const fileName = "chengdu_weather.xlsx";

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
});
