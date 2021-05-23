const { expose } = require('threads/worker');
const FaceDetect = require('../ML/faceDetection.js');

class FaceDetectWorker {
  constructor() {
    this.faceDetect = new FaceDetect();
    this.init();
  }

  async init() {
    try {
      await this.faceDetect.load();
    } catch (e) {
      console.log(e);
    }
  }

  // sharp image buffer as input
  async getFacesAsBuffer(sharpImageBuffer) {
    try {
      const faces = await this.faceDetect.getFacesAsImageBuffer(
        sharpImageBuffer
      );
      return faces;
    } catch (e) {
      console.log('ERR: In face detect worker');
      console.log(e);
    }

    return null;
  }
}

expose({
  processImage() {
    console.log('This thread got data');
  },
});
