import Config from "../../config";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import getLogger from "@infra/logging/logger";
const logger = getLogger(__filename);

export class SQSProducer {
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: Config.server.aws.region,
      endpoint: Config.server.aws.sqs.url,
      credentials: {
        accessKeyId: Config.server.aws.accesskey,
        secretAccessKey: Config.server.aws.secretkey
      }
    });
  }

  public async sendMessage(queueName: string, messageBody: any): Promise<void> {
    const queueUrl = `${Config.server.aws.sqs.url}/${queueName}`;

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
