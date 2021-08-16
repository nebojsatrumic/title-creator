import * as hapi from "@hapi/hapi";
import * as fs from "fs";
import * as path from "path";

async function getRoutes(): Promise<hapi.ServerRoute[]> {
  const files = fs.readdirSync(__dirname);

  const routePromises = [];
  for (const fileName of files) {
    if (!fileName.startsWith("index") && !fileName.startsWith("constants")) {
      const route: Promise<hapi.ServerRoute[]> = import(path.join(__dirname, fileName)).then(
        (imported): hapi.ServerRoute[] => imported.default
      );
      routePromises.push(route);
    }
  }

  const awaitedPartialRoutes: hapi.ServerRoute[][] = await Promise.all(routePromises);
  return awaitedPartialRoutes.flat();
}

export default getRoutes;
