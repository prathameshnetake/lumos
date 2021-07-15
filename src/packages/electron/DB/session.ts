import { Knex } from "knex";

export interface SessionBlob {
  sessionId: string;
  indexFilePath: string;
  sessionName: string;
}

export const createSessionIfNotExists = async (
  knexInstance: Knex<any, unknown[]>
) => {
  try {
    const exists = await knexInstance.schema.hasTable("session");

    if (!exists) {
      await knexInstance.schema.createTable("session", (table) => {
        table.integer("id").primary();
        table.string("sessionId");
        table.string("sessionName");
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

export const getAllSessions = async (knexInstance: Knex<any, unknown[]>) => {
  const exists = await knexInstance.schema.hasTable("session");

  if (!exists) {
    return [];
  }

  try {
    return await knexInstance("session").select("*");
  } catch (e) {
    return Promise.reject(e);
  }
};

export const inserSessiontItem = async (
  knexInstance: Knex<any, unknown[]>,
  data: SessionBlob
) => {
  try {
    return knexInstance("session").insert(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
