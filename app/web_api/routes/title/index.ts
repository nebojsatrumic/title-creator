import * as hapi from "@hapi/hapi";
import {authenticationHeader, badRequestSchema, domainErrorSchema, serverErrorSchema} from "../constants";
import {titleController} from "./controller";
import {createTitleSchema, idParam, titleResponseSchema} from "./validation";

const routes: hapi.ServerRoute[] = [
  {
    method: "GET",
    path: "/title/{id}",
    handler: async (request: hapi.Request, h: hapi.ResponseToolkit) => {
      return (await titleController()).get(request, h);
    },
    options: {
      auth: "custom-strategy",
      description: "Get the details of a title request based on id.",
      tags: ["api", "v1", "companies"],
      validate: {
        params: idParam,
        headers: authenticationHeader.unknown(),
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Title log successfully fetched",
              schema: titleResponseSchema.label("Result"),
            },
            500: serverErrorSchema,
            400: badRequestSchema,
          },
        },
      },
    },
  },
  {
    method: "POST",
    path: "/title/",
    handler: async (request, h) => {
      return (await titleController()).create(request, h);
    },
    options: {
      auth: "custom-strategy",
      description: "Create title request based on request data.",
      tags: ["api", "v1", "title"],
      validate: {
        payload: createTitleSchema,
        headers: authenticationHeader.unknown(),
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Title request successfully created",
              schema: titleResponseSchema.label("Result"),
            },
            500: serverErrorSchema,
            400: badRequestSchema,
            404: domainErrorSchema,
          },
        },
      },
    },
  },
];

export default routes;
