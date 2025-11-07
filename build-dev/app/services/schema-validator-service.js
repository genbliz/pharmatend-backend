import Joi from "joi";
import { GenericFriendlyError } from "../utils/errors.js";
function getJoiValidationErrors(err) {
    if (err?.details?.length) {
        const details = JSON.parse(JSON.stringify(err.details));
        const joiData = details.map((x) => x.message.replace(new RegExp('"', "g"), ""));
        return joiData.join("; ");
    }
    return "";
}
class SchemaValidatorServiceBase {
    async joiSchemaValidate({ schemaDef, data, errorMesssagePrefix, canThrowTheError, }) {
        const schema = Joi.object().keys({ ...schemaDef });
        const { error, value } = schema.validate(data, {
            allowUnknown: true,
            skipFunctions: true,
        });
        if (error) {
            const msg = getJoiValidationErrors(error) || "Validation error occured";
            const errorMesage = [errorMesssagePrefix, msg].filter((x) => x).join(": ");
            if (canThrowTheError) {
                throw GenericFriendlyError.createValidationError(errorMesage);
            }
            return await Promise.resolve({ validatedData: undefined, errorMesage });
        }
        return await Promise.resolve({ validatedData: value, errorMesage: undefined });
    }
    async joiSchemaValidateOrThrowError({ schemaDef, data, }) {
        const { validatedData } = await this.joiSchemaValidate({
            schemaDef,
            data,
            canThrowTheError: true,
        });
        return validatedData;
    }
}
export const SchemaValidatorService = new SchemaValidatorServiceBase();
//# sourceMappingURL=schema-validator-service.js.map