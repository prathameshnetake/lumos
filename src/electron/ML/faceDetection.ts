import * as tf from "@tensorflow/tfjs-node";
import { Tensor2D, Tensor3D, Tensor4D } from "@tensorflow/tfjs-node";
import { Sharp } from "sharp";

declare interface AnchorsConfig {
  strides: [number, number];
  anchors: [number, number];
}

function decodeBounds(
  boxOutputs: tf.Tensor2D,
  anchors: tf.Tensor2D,
  inputSize: tf.Tensor1D
): tf.Tensor2D {
  return tf.tidy(() => {
    const boxStarts = tf.slice(boxOutputs, [0, 1], [-1, 2]);
    const centers = tf.add(boxStarts, anchors);
    const boxSizes = tf.slice(boxOutputs, [0, 3], [-1, 2]);

    const boxSizesNormalized = tf.div(boxSizes, inputSize);
    const centersNormalized = tf.div(centers, inputSize);

    const halfBoxSize = tf.div(boxSizesNormalized, 2);
    const starts = tf.sub(centersNormalized, halfBoxSize);
    const ends = tf.add(centersNormalized, halfBoxSize);

    const startNormalized = tf.mul(starts, inputSize);
    const endNormalized = tf.mul(ends, inputSize);

    const concatAxis = 1;
    return tf.concat2d(
      [startNormalized as tf.Tensor2D, endNormalized as tf.Tensor2D],
      concatAxis
    );
  });
}

function generateAnchors(
  width: number,
  height: number,
  outputSpec: AnchorsConfig
): number[][] {
  const anchors = [];
  for (let i = 0; i < outputSpec.strides.length; i += 1) {
    const stride = outputSpec.strides[i];
    const gridRows = Math.floor((height + stride - 1) / stride);
    const gridCols = Math.floor((width + stride - 1) / stride);
    const anchorsNum = outputSpec.anchors[i];

    for (let gridY = 0; gridY < gridRows; gridY += 1) {
      const anchorY = stride * (gridY + 0.5);

      for (let gridX = 0; gridX < gridCols; gridX += 1) {
        const anchorX = stride * (gridX + 0.5);
        for (let n = 0; n < anchorsNum; n += 1) {
          anchors.push([anchorX, anchorY]);
        }
      }
    }
  }

  return anchors;
}

const createBox = (input: Tensor2D) => ({
  topLeft: tf.slice(input, [0, 0], [-1, 2]),
  bottomRight: tf.slice(input, [0, 2], [-1, 2]),
});

const scaledBox = (box: ReturnType<typeof createBox>, scale: tf.Tensor2D) => {
  const topLeft = [...tf.mul(box.topLeft, scale).dataSync()].map((a) =>
    Math.ceil(a)
  );
  const bottomRight = [...tf.mul(box.bottomRight, scale).dataSync()].map((a) =>
    Math.ceil(a)
  );

  return { topLeft, bottomRight };
};

export default class FaceDetect {
  model: tf.GraphModel;

  maxFaces = 10;

  inputWidth = 256;

  inputHeight = 256;

  iouThreshold = 0.3;

  scoreThreshold = 0.75;

  ANCHORS_CONFIG: AnchorsConfig = {
    strides: [this.inputWidth / 16, this.inputWidth / 8],
    anchors: [2, 6],
  };

  anchorsData: number[][];

  async load() {
    try {
      this.model = await tf.loadGraphModel(
        `file://${__dirname}/models/blazeface.json`
      );
      this.anchorsData = generateAnchors(
        this.inputWidth,
        this.inputHeight,
        this.ANCHORS_CONFIG
      );
      console.log("Model has been loaded");
    } catch (e) {
      console.error(e);
    }
  }

  async preprocess(input: tf.Tensor3D): Promise<tf.Tensor4D> {
    const image = tf.expandDims(input, 0) as Tensor4D;
    const resizedImage = image.resizeBilinear([
      this.inputWidth,
      this.inputHeight,
    ]);

    const processed = tf.div(resizedImage, 255) as Tensor4D;
    input.dispose();
    image.dispose();
    resizedImage.dispose();

    return processed;
  }

  async estimateFaces(input: tf.Tensor3D) {
    const preprocessed = await this.preprocess(input as tf.Tensor3D);
    input.dispose();
    const [boxes, scores] = tf.tidy((): [
      tf.Tensor2D,
      Float32Array | Int32Array | Int32Array | Uint8Array
    ] => {
      // [1, 897, 17] 1 = batch, 897 = number of anchors
      const batchedPrediction = this.model.predict(
        preprocessed
      ) as tf.Tensor<tf.Rank>[];
      const sorted = batchedPrediction.sort((a, b) => a.size - b.size);
      const concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
      const concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
      const concat = tf.concat([concat512, concat384], 1);
      const batchOut = concat.squeeze();

      // return batchOut as Tensor2D;

      const boxesOut = decodeBounds(
        batchOut as Tensor2D,
        tf.tensor2d(this.anchorsData),
        tf.tensor1d([this.inputWidth, this.inputHeight])
      );
      const logits = tf.slice(batchOut, [0, 0], [-1, 1]);
      const scoresOut = tf.sigmoid(logits).squeeze().dataSync();
      return [boxesOut, scoresOut];
    });

    preprocessed.dispose();

    const nmsTensor = await tf.image.nonMaxSuppressionAsync(
      boxes,
      scores,
      10,
      this.iouThreshold,
      0.5
    );
    const nms = nmsTensor.arraySync();
    nmsTensor.dispose();
    const scale = tf.tensor([
      input.shape[1] / this.inputWidth,
      input.shape[0] / this.inputHeight,
    ]);

    const faces = [];
    for (let i = 0; i < nms.length; i += 1) {
      const confidence = scores[nms[i]];
      if (confidence > 0.5) {
        const boundingBox = tf.slice(boxes, [nms[i], 0], [1, -1]);
        const box = createBox(boundingBox);
        const original = scaledBox(box, scale as Tensor2D);
        faces.push(original);
      }
    }
    return faces;
  }

  async getFacesAsImageBuffer(sharpImage: Sharp) {
    const buffer = await sharpImage.toBuffer();
    const imgTensor = tf.node.decodeImage(buffer, 3);
    const faces = await this.estimateFaces(imgTensor as Tensor3D);
    imgTensor.dispose();
    return Promise.all(
      faces.map((face) => {
        return (
          sharpImage
            .extract({
              top: face.topLeft[1],
              left: face.topLeft[0],
              height: face.bottomRight[1] - face.topLeft[1],
              width: face.bottomRight[0] - face.topLeft[0],
            })
            // .resize(112, 112)
            .toBuffer()
        );
      })
    );
  }
}

// const run = async () => {
//   const imagePath = 'D:\\omkar birthday\\20200627_200133.JPG';
//   const sharpImage = sharp(imagePath);
//   const buffer = await sharpImage.toBuffer();
//   const imgTensor = tf.node.decodeImage(buffer, 3);

//   const a = new FaceDetect();
//   await a.load();
//   const faces = await a.estimateFaces(imgTensor as Tensor3D);

// faces.forEach((face, index) => {
//   sharpImage
//     .extract({
//       top: face.topLeft[1],
//       left: face.topLeft[0],
//       height: face.bottomRight[1] - face.topLeft[1],
//       width: face.bottomRight[0] - face.topLeft[0],
//     })
//     .toFile(`test-${index}.jpg`);
// });
// };

// run();
