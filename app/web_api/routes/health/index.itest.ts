import {init, server} from "../../server";
import {AUTH_HEADER, HEALTH_ROUTE} from "../constants";

describe("Health check", (): void => {
  beforeAll(
    async (): Promise<void> => {
      await init();
    }
  );
  afterAll(async () => {
    await server.stop();
  });

  it("should return success from health route", async (): Promise<void> => {
    const response = await server.inject({url: HEALTH_ROUTE, headers: AUTH_HEADER});

    expect(response.statusCode).toEqual(200);
  });
});
