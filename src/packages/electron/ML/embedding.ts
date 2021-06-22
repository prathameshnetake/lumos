import * as tf from "@tensorflow/tfjs-node";
import { Tensor4D } from "@tensorflow/tfjs-node";

export default class FaceEmbeddings {
  model: tf.GraphModel;

  async load() {
    try {
      this.model = await tf.loadGraphModel(
        `file://${__dirname}/models/model.json`
      );
    } catch (e) {
      console.error(e);
    }
  }

  static async preprocess(input: tf.Tensor3D): Promise<tf.Tensor4D> {
    return tf.tidy(() => {
      const normalized = input.div(tf.scalar(255)) as tf.Tensor4D;
      // input received from detector is already normalized to 0..1
      // input is also assumed to be straightened
      // const data = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model
      // do a tight crop of image and resize it to fit the model
      const box = [[0.05, 0.15, 0.85, 0.85]];
      const crop = tf.image.cropAndResize(
        normalized.expandDims(0) as tf.Tensor4D,
        box,
        [0],
        [112, 112]
      );

      // convert to black&white to avoid colorization impact
      const rgb = [0.2989, 0.587, 0.114]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
      const [red, green, blue] = tf.split(crop, 3, 3);
      const redNorm = tf.mul(red, rgb[0]);
      const greenNorm = tf.mul(green, rgb[1]);
      const blueNorm = tf.mul(blue, rgb[2]);
      const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
      const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze([4]);

      /*
      // optional increase image contrast
      // or do it per-channel so mean is done on each channel
      // or do it based on histogram
      const mean = merge.mean();
      const factor = 5;
      const contrast = merge.sub(mean).mul(factor).add(mean);
      */

      // normalize brightness from 0..1
      const darken = merge.sub(merge.min());
      const lighten = darken.div(darken.max());

      return lighten as Tensor4D;
    });
  }

  async predict(input: tf.Tensor) {
    const preprocessed = await FaceEmbeddings.preprocess(input as tf.Tensor3D);

    const res = this.model.predict(preprocessed) as tf.Tensor;

    input.dispose();
    preprocessed.dispose();
    // const reshape = res[1].reshape([128, 2]); // split 256 vectors into 128 x 2
    // const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it

    const output = res.dataSync();
    return [...output]; // convert typed array to simple array
  }

  async predictBuffer(input: Buffer) {
    const imageTensor = tf.node.decodeImage(input);
    return await this.predict(imageTensor);
  }
}

// const run = async () => {
//   const imagePath =
//     "C:\\Users\\Alex\\AppData\\Local\\Temp\\Electron\\3e85c484-f645-4c71-9749-0a9060009711.jpg";
//   const buffer = await sharp(imagePath).toBuffer();
//   const imgTensor = tf.node.decodeImage(buffer);
//   const a = new FaceEmbeddings();
//   await a.load();
//   const embeddings = await a.predict(imgTensor as tf.Tensor3D);
//   console.log(embeddings);
// };

// run();
