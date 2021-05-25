import * as tf from "@tensorflow/tfjs-node";

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
    const box = [[0.05, 0.15, 0.85, 0.85]];
    return tf.image.cropAndResize(
      input.expandDims(0) as tf.Tensor4D,
      box,
      [0],
      [112, 112]
    );
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
//   const imagePath = 'C:\\Users\\Alex\\git\\accio\\test-3.jpg';
//   const buffer = await sharp(imagePath).toBuffer();
//   const imgTensor = tf.node.decodeImage(buffer);
//   const a = new FaceEmbeddings();
//   await a.load();
//   const embeddings = await a.predict(imgTensor as tf.Tensor3D);
// };

// run();
