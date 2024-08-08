require("./infra/env/AliasConfig");
import { EnvManager } from "@infra/env/EnvManager";
const setupEnv = async () => {
  await EnvManager.initialize();
};

setupEnv().then(() => {
  //after the environment variables are properly setup start the rest of the application
  require("./express");
});
