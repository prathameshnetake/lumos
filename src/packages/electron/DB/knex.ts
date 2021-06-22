import knex from "knex";

export const getKnexInstance = (dbFilePath: string) => {
  return knex({
    client: "sqlite3",
    connection: {
      filename: dbFilePath,
    },
    useNullAsDefault: true,
  });
};
