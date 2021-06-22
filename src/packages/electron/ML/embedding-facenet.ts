import * as tf from "@tensorflow/tfjs-node";
import { Tensor4D } from "@tensorflow/tfjs-node";
import { TFSavedModel } from "@tensorflow/tfjs-node/dist/saved_model";
import path from "path";
import sharp from "sharp";
import { getModelPath, ModelType } from "./utils";

export default class FaceEmbeddings {
  model!: TFSavedModel;

  async load() {
    try {
      this.model = await tf.node.loadSavedModel(
        getModelPath(ModelType.FACE_FEATURES_FACENET)
      );
    } catch (e) {
      console.error(e);
    }
  }

  static async preprocess(input: tf.Tensor3D): Promise<tf.Tensor4D> {
    return tf.tidy(() => {
      let preprocessed = tf.expandDims(input, 0);
      preprocessed = preprocessed.div(255);
      return preprocessed as Tensor4D;
    });
  }

  async predict(input: tf.Tensor) {
    const preprocessed = await FaceEmbeddings.preprocess(input as tf.Tensor3D);

    const res = this.model.predict(preprocessed) as tf.Tensor;

    input.dispose();
    preprocessed.dispose();

    const output = res.dataSync();
    return [...output]; // convert typed array to simple array
  }

  async predictBuffer(input: Buffer) {
    const resized = await sharp(input).resize(160, 160).toBuffer();

    const imageTensor = tf.node.decodeImage(resized);
    return await this.predict(imageTensor);
  }

  async destruct() {
    this.model.dispose();
  }
}

// const run = async () => {
//   const imagePath =
//     "C:\\Users\\Alex\\AppData\\Local\\Temp\\Electron\\3e85c484-f645-4c71-9749-0a9060009711.jpg";
//   const buffer = await sharp(imagePath).toBuffer();
//   const imgTensor = tf.node.decodeImage(buffer);
//   console.log(imgTensor);
//   const a = new FaceEmbeddings();
//   await a.load();
//   const embeddings = await a.predict(imgTensor as tf.Tensor3D);
//   console.log(embeddings);
// };

// run();
