import { UtilService } from "@/services/util-service";
import { envConfig, lambdaDefinedEnvConfig } from "@/config/env";
//
export interface ISystemPreference {
  isS3FileStorageEnabled: boolean;
}

class SystemConfigServiceBase {
  // private _isLocalDeploy: boolean | null = null;

  isServerlessDeploy() {
    return this.isLambdaEnvironment() || envConfig.APP_DEPLOY_KIND === "SERVERLESS";
  }

  private isLocalDeployBase() {
    return envConfig.APP_DEPLOY_KIND === "LOCAL";
  }

  isLocalDeploy() {
    if (this.isServerlessDeploy()) {
      return false;
    }
    if (this.isLocalDeployBase()) {
      return true;
    }
    return true;
  }

  isS3FileStoreEnabled(): boolean {
    if (envConfig.CAN_ENABLE_S3_FILE_STORAGE) {
      return true;
    }
    if (this.isServerlessDeploy()) {
      return true;
    }
    return false;
  }

  async getAllConfig(): Promise<ISystemPreference> {
    const config: ISystemPreference = {
      isS3FileStorageEnabled: this.isS3FileStoreEnabled(),
    };
    return Promise.resolve(config);
  }

  async getLocalSiteBaseUrl() {
    const port = envConfig.APP_SITE_PORT;
    if (!port) {
      return envConfig.APP_SERVER_BASE_URL;
    }
    const ip = await UtilService.getComputerIpAddress();
    return ["http://", ip, ":", port].join("");
  }

  isLambdaEnvironment() {
    if (
      lambdaDefinedEnvConfig._HANDLER &&
      lambdaDefinedEnvConfig.LAMBDA_RUNTIME_DIR &&
      lambdaDefinedEnvConfig.LAMBDA_TASK_ROOT &&
      lambdaDefinedEnvConfig.AWS_LAMBDA_FUNCTION_NAME
    ) {
      return true;
    }
    return false;
  }
}

export const SystemService = new SystemConfigServiceBase();
