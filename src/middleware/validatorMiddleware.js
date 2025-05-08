// validation middleware for validating request payloads using Joi
import { sendErrorResponse } from "../common/response.js";


export const payloadValidate = (schema) => {
    return (req, res, next) => {
      const { error } = schema?.validate(req.body, { abortEarly: false });
  
      if (error) {
        const errorMessages = error.details.map((err) => err.message);
        return sendErrorResponse(res, 400, errorMessages[0]);
      }
      next();
    };
  };