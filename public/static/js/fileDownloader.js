class FileDownloader {
  constructor({
    url,
    fileName,
    chunkSize = 1 * 1024 * 1024,
    success,
    progress,
    begin,
  }) {
    this.url = url;
    this.fileName = fileName;
    this.chunkSize = chunkSize;
    this.fileSize = 0;
    this.totalChunks = 0;
    this.currentChunk = 0;
    this.downloadedSize = 0;
    this.chunks = [];
    this.abortController = new AbortController();
    this.taskQueue = new TaskQueue(3);
    this.paused = false;
    this.cb = {
      begin: begin,
      success: success,
      progress: progress,
    };
  }

  async getFileSize() {
    const response = await fetch(this.url, {
      method: "HEAD",
      signal: this.abortController.signal,
    });
    const contentLength = response.headers.get("content-length");
    this.fileSize = parseInt(contentLength);
    this.totalChunks = Math.ceil(this.fileSize / this.chunkSize);
  }

  async downloadChunk(chunkIndex) {
    try {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(
        this.fileSize,
        (chunkIndex + 1) * this.chunkSize - 1
      );

      const response = await fetch(this.url, {
        headers: {
          Range: `bytes=${start}-${end === this.fileSize ? "" : end}`,
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      this.chunks[chunkIndex] = blob;
      this.downloadedSize += blob.size;
      this.cb.progress &&
        this.cb.progress({
          loaded: this.downloadedSize,
          total: this.fileSize,
        });

      if (this.downloadedSize === this.fileSize) {
        this.mergeChunks();
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  async startDownload() {
    if (this.chunks.length === 0) {
      await this.getFileSize();
    }

    for (let index = 0; index < this.totalChunks; index++) {
      this.taskQueue.add(() => this.downloadChunk(index));
    }

    this.cb.begin && this.cb.begin();
  }

  cancelDownload() {
    this.abortController.abort();
    this.reset();
  }

  async mergeChunks() {
    const blob = new Blob(this.chunks, { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      this.cb.success &&
        this.cb.success({
          status: 1,
        });
      this.reset();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  reset() {
    this.chunks = [];
    this.fileName = "";
    this.fileSize = 0;
    this.totalChunks = 0;
    this.currentChunk = 0;
    this.downloadedSize = 0;
  }
}
