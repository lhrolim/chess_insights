import * as fs from "fs";
import * as path from "path";
import * as AWS from "aws-sdk";
import dotenv from "dotenv";

export class EnvManager {
  static loadEnvFile() {
    const envFilePath = path.resolve(__dirname, ".env");
    if (fs.existsSync(envFilePath)) {
      const result = dotenv.config({ path: envFilePath });
      if (result.error) {
        throw result.error;
      }
    }
  }

  static async loadEnvFromAWS() {
    const ssm = new AWS.SSM({ region: process.env.AWS_REGION });
    const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION });

    // Define the parameter names and secret names
    const parameterNames = ["/your-app-prefix/DB_PASSWORD", "/your-app-prefix/API_KEY"];
    const secretNames = ["your-secret-name"];

    try {
      // Fetch parameters from SSM
      const ssmData = await ssm
        .getParameters({
          Names: parameterNames,
          WithDecryption: true
        })
        .promise();

      ssmData.Parameters.forEach(param => {
        const paramName = param.Name.split("/").pop();
        if (paramName && param.Value) {
          process.env[paramName] = param.Value;
        }
      });

      // Fetch secrets from Secrets Manager
      for (const secretName of secretNames) {
        const secretData = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        if (secretData.SecretString) {
          const secrets = JSON.parse(secretData.SecretString);
          Object.keys(secrets).forEach(key => {
            process.env[key] = secrets[key];
          });
        }
      }
    } catch (err) {
      console.error("Error fetching parameters from AWS", err);
    }
  }

  public static async initialize() {
    // Always load from .env file first
    this.loadEnvFile();

    // Then override with AWS data if in production
    if (process.env.NODE_ENV === "production") {
      await this.loadEnvFromAWS();
    }
  }
}

// Initialize environment variables
// EnvManager.initialize()
//   .then(() => {
//     // Start your application here, e.g., import and run your main module
//     // require('./main'); // Uncomment and adjust this line as needed
//   })
//   .catch(err => {
//     console.error("Error during environment initialization", err);
//   });
