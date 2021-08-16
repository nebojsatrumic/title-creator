import Joi from "joi";

export const baseMessageSchema = Joi.object({
  cid: Joi.string().required(),
  version: Joi.string().required(),
  body: Joi.object({}).required(),
});
