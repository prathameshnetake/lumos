import { join, resolve } from "path";
import { pathToFileURL } from "url";
import config from "../../../../config";

/**
 * Workaround for TypeScript bug
 * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
 */
const env = import.meta.env;

export enum ModelType {
  FACE_DETECTION = 1,
  FACE_FEATURES_FACENET,
}

export const getModelPath = (modelType: ModelType): string => {
  switch (modelType) {
    case ModelType.FACE_DETECTION:
      if (env.DEV) {
        return `file://${resolve(
          join(__dirname, "../", "models", "blazeface.json")
        )}`;
      }
      return `file://${__dirname}/../models/blazeface.json`;
    case ModelType.FACE_FEATURES_FACENET:
      if (env.DEV) {
        return `${resolve(join(__dirname, "../", "models", "facenet"))}`;
      }
      return `${__dirname}/../models/facenet/`;
    default:
      return "";
  }
};
