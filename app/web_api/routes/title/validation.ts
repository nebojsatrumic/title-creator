import * as Joi from "joi";

export const idParam = Joi.object({
  id: Joi.string().required(),
});

export const createTitleSchema = Joi.object({
  text: Joi.string().required(),
});
export const titleResponseSchema = Joi.object({
  id: Joi.string(),
  text: Joi.string(),
  shortName: Joi.string(),
  hash: Joi.string(),
  status: Joi.string(),
});
