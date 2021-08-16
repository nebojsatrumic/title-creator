import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import HapiSwagger from "hapi-swagger";
import Pack from "../../../package.json";

const swaggerPlugin = [
  {
    plugin: Inert,
  },
  {
    plugin: Vision,
  },
  {
    plugin: HapiSwagger,
    options: {
      info: {
        title: `${Pack.name} API Docs`,
        version: Pack.version,
        description: Pack.description,
      },
      documentationPath: "/",
    },
  },
];

export default swaggerPlugin;
