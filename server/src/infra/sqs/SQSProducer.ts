import Config from "../../config";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import getLogger from "@infra/logging/logger";
const logger = getLogger(__filename);

export class SQSProducer {
  private sqsClient: SQSClient;

  constructor() {
    const awsConfig = Config.server.aws;
    this.sqsClient = new SQSClient({
      region: awsConfig.region,
      endpoint: awsConfig.sqs.url,
      credentials: {
        accessKeyId: awsConfig.accesskey,
        secretAccessKey: awsConfig.secretkey
      }
    });
  }

  public async sendMessage(queueName: string, messageBody: any): Promise<void> {
    const queueUrl = `${Config.server.aws.sqs.url}/${Config.server.aws.accountID}/${queueName}`;

    const messageBodyString = JSON.stringify(messageBody);

    const params = {
      QueueUrl: queueUrl,
      MessageBody: messageBodyString
    };

    try {
      const command = new SendMessageCommand(params);
      const data = await this.sqsClient.send(command);
      console.log(`Message sent successfully, ID: ${data.MessageId}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}
