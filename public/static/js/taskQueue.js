class TaskQueue {
  constructor(maxRunning = 3) {
    this.queue = [];
    this.running = 0;
    this.maxRunning = maxRunning;
  }

  add(task) {
    this.queue.push(task);
    this.run();
  }

  run() {
    if (this.running >= this.maxRunning || this.queue.length === 0) {
      return;
    }
    const task = this.queue.shift();
    this.running++;
    task().finally(() => {
      this.running--;
      this.run();
    });
  }
}
