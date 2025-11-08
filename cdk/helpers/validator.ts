class ValidatorBase {
  validateRequiredNumber(keyValueValidates: { [key: string]: number }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(!isNaN(Number(value)) && typeof value === "number")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateRequiredString(keyValueValidates: { [key: string]: string | null | undefined }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  private createFriendlyError(message: string) {
    return new Error(message);
  }

  convertObjectToJsonPlainObject<T>(objData: T) {
    const objDataPlain: T = JSON.parse(JSON.stringify(objData));
    return objDataPlain;
  }

  validateAndParseOptions({
    stage,
    stackName,
    NODE_ENV,
  }: {
    stage: "staging" | "production" | undefined;
    stackName: string;
    NODE_ENV: string;
  }) {
    if (!stage) {
      throw new Error("stage context required");
    }

    if (!stackName) {
      throw new Error("stackName required");
    }

    if (!["staging", "production"].includes(stage)) {
      throw new Error("Invalid stage name");
    }

    const stackNameSuffix = stackName.split("-").at(-1);

    if (stage !== stackNameSuffix) {
      throw new Error("Invalid stackName or stage");
    }

    // console.log({ stage, stackName, parsedEnv, environmentalVariableKeys });

    Validator.validateRequiredString({ NODE_ENV });

    if (stage !== NODE_ENV) {
      throw new Error("stage and NODE_ENV not in sync");
    }

    return { stackName, stage };
  }
}

export const Validator = new ValidatorBase();
