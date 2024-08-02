require("module-alias/register");
import dotenv from "dotenv";
dotenv.config(); // Setup .env
import Config from "../config";
import { SQSClient } from "@aws-sdk/client-sqs";
import { errorMiddleware } from "@infra/middlewares/errorMiddleware";
import getLogger from "@infra/logging/logger";
const logger = getLogger("worker");

import { Consumer } from "sqs-consumer";

const awsConfig = Config.server.aws;

const app = Consumer.create({
  queueUrl: `${awsConfig.sqs.url}/${awsConfig.accountID}/${awsConfig.sqs.topic_names.pgn}`,
  handleMessage: async message => {
    logger.info(`Received message: ${message.Body}`);
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

app.start();
