document.getElementById("downloadBtn").addEventListener("click", async () => {
  const url = "http://localhost:3001/download/chengdu_weather.xlsx";
  const fileName = "chengdu_weather.xlsx";

  const downloader = new FileDownloader({
    url,
    fileName,
    success: ({ status }) => {
      console.log(`下载成功：${status}%`);
    },
    progress: ({ loaded, total }) => {
      const progress = Math.floor((loaded / total) * 100);
      document.getElementById("progressBar").value = progress;
      document.getElementById("status").textContent = `已下载: ${progress}%`;
    },
    reset: () => {
      document.getElementById("progressBar").value = 0;
      document.getElementById("status").textContent = `已下载: ${0}%`;
    },
  });
  // 开始下载
  downloader.startDownload();

  // 暂停下载
  // downloader.pauseDownload();

  // 继续下载
  // downloader.resumeDownload();

  // 取消下载
  // downloader.cancelDownload();
});
