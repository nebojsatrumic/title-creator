import * as hapi from "@hapi/hapi";
import {HEALTH_ROUTE} from "../constants";
import { healthController } from "./controller";

const routes: hapi.ServerRoute[] = [
  {
    method: "GET",
    path: HEALTH_ROUTE,
    handler: healthController.get,
    options: {
      description: "Health check if server and database are up.",
      tags: ["api"],
    },
  },
];

export default routes;
