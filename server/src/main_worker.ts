require("./infra/env/AliasConfig");
import { EnvManager } from "@infra/env/EnvManager";
import { PGNSQSConsumer } from "./worker/PGNSQSConsumer";
const setupEnv = async () => {
  await EnvManager.initialize();
};

setupEnv().then(() => {
  //after the environment variables are properly setup start the rest of the application
  require("./worker/PGNWorkerMain");
});
