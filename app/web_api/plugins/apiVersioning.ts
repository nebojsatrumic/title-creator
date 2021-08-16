import * as hapi from "@hapi/hapi";
import Pack from "../../../package.json";

const contentTypeHeader = "Content-Type";

const addApiVersionToResponseHeader = (request: any, server: hapi.Server): void => {
  const {response} = request;
  const route = server.match(request.method, request.url.pathname);

  if (!route) return;
  if (!route.settings.tags || route.settings.tags.length <= 1) return;

  const apiVersionTag = route.settings.tags.find((tag: string): boolean => tag.startsWith("v"));
  if (!apiVersionTag) return;

  const apiVersion = apiVersionTag.substr(1);
  const headerValue = `application/json; version=${apiVersion}`;

  if (request.response.isBoom) {
    response.output.headers[contentTypeHeader] = headerValue;
  } else {
    response.header(contentTypeHeader, headerValue);
  }
};

export default {
  plugin: {
    name: "api-versioning",
    version: Pack.version,
    register(server: hapi.Server): void {
      server.ext("onPreResponse", (request: any, h: hapi.ResponseToolkit): symbol => {
        addApiVersionToResponseHeader(request, server);

        return h.continue;
      });
    },
  },
};
