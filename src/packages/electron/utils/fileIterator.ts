import fs from "fs-extra";
import pathlib from "path";

const validExtention = [".jpg", ".png"];

interface IFileDetails {
  path: string;
  name: string;
}

export async function* getAllImageFiles(
  path: string
): AsyncGenerator<IFileDetails> {
  const entries = fs.readdirSync(path, { withFileTypes: true });

  for (const file of entries) {
    if (file.isDirectory()) {
      yield* getAllImageFiles(`${path}${file.name}/`);
    } else {
      const ext = pathlib.extname(file.name);

      if (validExtention.indexOf(ext.toLocaleLowerCase()) !== -1) {
        yield { ...file, path: path + file.name };
      }
    }
  }
}

export const getAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      const ext = pathlib.extname(file);
      if (validExtention.indexOf(ext.toLocaleLowerCase()) !== -1) {
        arrayOfFiles!.push(pathlib.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};
