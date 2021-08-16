import Joi from "joi";

export const AUTH_HEADER = {key: "test-env-api-key"};

export const authenticationHeader = Joi.object({
  key: Joi.string().required(),
}).unknown();

export const badRequestSchema = {
  description: "Malformed request",
  schema: Joi.object({
    statusCode: Joi.string().example(400),
    error: Joi.string().example("Bad Request"),
    message: Joi.string().example("Invalid request payload input"),
  }),
};

export const domainErrorSchema = {
  description: "Domain error happened request failed",
  schema: Joi.object({
    code: Joi.string().example("80.20.01"),
    message: Joi.string().example("Entity doesn't exist"),
    details: Joi.any(),
  }),
};

export const serverErrorSchema = {
  description: "Server error happened! Try again later",
  schema: Joi.object({
    code: Joi.string().example("80.5"),
    message: Joi.string().example("Internal server error."),
    details: Joi.any(),
  }),
};

export const HEALTH_ROUTE = "/health";
