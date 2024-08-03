require("module-alias/register");
import dotenv from "dotenv";
dotenv.config(); // Setup .env
import Config from "../config";
import { SQSClient } from "@aws-sdk/client-sqs";
import { errorMiddleware } from "@infra/middlewares/errorMiddleware";
import getLogger from "@infra/logging/logger";
import { PGNSQSConsumer } from "./PGNSQSConsumer";
const logger = getLogger("worker");

import { Consumer } from "sqs-consumer";

import { connectToDatabase } from "@internal/database/MongoConnection";

async function initializeApplication() {
  const awsConfig = Config.server.aws;
  const worker = new PGNSQSConsumer();

  const app = Consumer.create({
    queueUrl: `${awsConfig.sqs.url}/${awsConfig.accountID}/${awsConfig.sqs.topic_names.pgn}`,
    handleMessage: async message => {
      logger.info(`Received message: ${message.Body}`);
      const gameURL = JSON.parse(message.Body);
      await worker.analyzeGame(gameURL);
    },
    extendedAWSErrors: true,
    sqs: new SQSClient({
      region: `${awsConfig.region}`,
      endpoint: `${awsConfig.sqs.url}`,
      credentials: {
        accessKeyId: `${awsConfig.accesskey}`,
        secretAccessKey: `${awsConfig.secretkey}`
      }
    })
  });

  app.on("error", err => {
    logger.error(err);
  });

  app.on("processing_error", err => {
    logger.error(err.message);
  });

  logger.info(`creating sqs worker`);
  await connectToDatabase();

  app.start();
}

initializeApplication().catch(error => {
  console.error("Failed to initialize the application", error);
  process.exit(1); // Exit with failure in case of an error
});
