import knex from "knex";

export const knexInstance = knex({
  client: "sqlite3",
  connection: {
    // filename: `${app.getAppPath()}/db.sqlite`,
    filename: `./db.sqlite`,
  },
  useNullAsDefault: true,
});
