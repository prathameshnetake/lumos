import { knexInstance } from "./knex";

export interface SessionBlob {
  sessionId: string;
  indexFilePath: string;
}

export const createSessionIfNotExists = async () => {
  try {
    const exists = await knexInstance.schema.hasTable("session");

    if (!exists) {
      await knexInstance.schema.createTable("session", (table) => {
        table.integer("id").primary();
        table.string("sessionId");
        table.string("indexFilePath");
      });

      return true;
    }

    console.log("Database already exists");

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

export const inserSessiontItem = async (data: SessionBlob) => {
  try {
    return knexInstance("session").insert(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
