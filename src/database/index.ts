import config, { appName } from "../config";
import path from "path";
import highland from "highland";
import fs from "fs";
import logger from "../logger";
import { load } from "dotenv";

export type User = {
  id: string;
  name: string;
  tenbisToken?: string;
};

export type State = {
  users: Record<string, User>;
};

const dbPath = path.join(path.resolve(config.DB_FILE_PATH), "db.json");

let loadedState: State | null;

export const getDataFromDisk = (): Promise<State> =>
  new Promise((r) =>
    loadedState
      ? r(loadedState)
      : highland(fs.createReadStream(dbPath))
          .errors(function (err, push) {
            console.log("Caught error:", err.message);
            push(null, JSON.stringify({ users: {} }));
          })
          .toArray(function (data: any[]) {
            const parsed = JSON.parse(data[0] || "{}");
            logger.info("DB loaded", { data: parsed, path: dbPath });
            loadedState = parsed;
            r(parsed);
          })
  );

export const updateState = async (nextState: State): Promise<State> => {
  return new Promise((r) =>
    highland([JSON.stringify(nextState)])
      .pipe(fs.createWriteStream(dbPath))
      .on("finish", () => {
        logger.info("Update state finished successfully");
        loadedState = nextState;
        r(loadedState);
      })
  );
};

export const addUser = (user: User): Promise<State> =>
  getDataFromDisk()
    .then((s) => {
      logger.info("Adding user to state");  
      s.users[user.id] = user;
      return s;
    })
    .then(updateState);
