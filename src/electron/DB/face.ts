import { knexInstance } from "./knex";

export interface FaceBlob {
  fileId: string;
  filePath: string;
  sessionId: string;
  annoyItemIndex: number;
}

export const createFaceIfNotExists = async () => {
  try {
    const exists = await knexInstance.schema.hasTable("face");

    if (!exists) {
      await knexInstance.schema.createTable("face", (table) => {
        table.integer("id").primary();
        table.string("fileId");
        table.string("filePath");
        table.string("sessionId");
        table.integer("annoyItemIndex");
      });

      return true;
    }

    console.log("Database already exists");

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

export const insertFaceItem = async (data: FaceBlob) => {
  try {
    return knexInstance("face").insert(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
