import async from "async";
import sharp from "sharp";
import Face from "../ML/faceDetection";

export default class Manager {
  file_queue!: async.QueueObject<string>;

  faceDetectionWorker: any;

  async init() {
    this.file_queue = async.queue(this.processFile.bind(this), 1);
    const a = new Face();
    await a.load();

    console.log(this.faceDetectionWorker);
  }

  // eslint-disable-next-line class-methods-use-this
  async processFile(filePath: string, callback: (e?: Error) => void) {
    try {
      console.log(filePath);
      const sharpImage = sharp(filePath);
      callback();
    } catch (e) {
      console.log("ERR: Processing file", filePath);
      console.log(e);
      callback(e);
    }
  }

  addFileToQueue(path: string) {
    this.file_queue.push(path);
  }
}
