import Joi from "joi";

// Validation schema for user creation
export const createUserValidation = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(0).max(120),
  });