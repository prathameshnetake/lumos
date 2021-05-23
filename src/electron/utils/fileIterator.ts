import fs from "promise-fs";
import pathlib from "path";

const validExtention = [".jpg", ".png"];

interface IFileDetails {
  path: string;
  name: string;
}

export default async function* getAllImageFiles(
  path: string
): AsyncGenerator<IFileDetails> {
  const entries = await fs.readdir(path, { withFileTypes: true });

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
