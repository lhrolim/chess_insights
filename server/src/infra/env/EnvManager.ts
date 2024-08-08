import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParametersByPathCommand, GetParametersByPathCommandOutput } from "@aws-sdk/client-ssm";
import dotenv from "dotenv";
import { getConfig } from "../../config";

export class EnvManager {
  static loadEnvFile() {
    dotenv.config();
  }

  static async loadFromAWSSSM() {
    const region = process.env.AWS_REGION || "us-east-1";
    const ssmClient = new SSMClient({ region });
    const secretsManagerClient = new SecretsManagerClient({ region });
    let config = getConfig();

    const parameterPathPrefix = "/chesswiz/";

    try {
      // Fetch parameters from SSM by path
      const parameters = [];
      let nextToken;
      do {
        const command = new GetParametersByPathCommand({
          Path: parameterPathPrefix,
          WithDecryption: true,
          NextToken: nextToken
        });
        const ssmData: GetParametersByPathCommandOutput = await ssmClient.send(command);

        if (ssmData.Parameters) {
          parameters.push(...ssmData.Parameters);
        }

        nextToken = ssmData.NextToken;
        console.log(`NextToken: ${nextToken}`);
      } while (nextToken);
      const database = config.server.database;
      parameters.forEach(param => {
        const paramName = param.Name.split("/").pop();
        if (paramName && param.Value) {
          process.env[paramName] = param.Value;
        }
      });
      config = getConfig();
    } catch (err) {
      console.error("Error fetching parameters from AWS", err);
    }
  }

  public static async initialize() {
    // Always load from .env file first
    this.loadEnvFile();

    // Then override with AWS data if in production
    if (process.env.NODE_ENV === "production") {
      await this.loadFromAWSSSM();
    }
  }
}
