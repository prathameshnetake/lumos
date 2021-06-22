import { Knex } from "knex";

export interface FaceBlob {
  fileId: string;
  filePath: string;
  sessionId: string;
  annoyItemIndex: number;
}

export const createFaceIfNotExists = async (
  knexInstance: Knex<any, unknown[]>
) => {
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

export const insertFaceItem = async (
  knexInstance: Knex<any, unknown[]>,
  data: FaceBlob
) => {
  try {
    return knexInstance("face").insert(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const findFacesByAnnoyIndex = (
  knexInstance: Knex<any, unknown[]>,
  sessionId: string,
  indexList: number[]
) => {
  return knexInstance("face")
    .where({ sessionId })
    .andWhere((builder) => {
      builder.whereIn("annoyItemIndex", indexList);
    })
    .select("*");
};
