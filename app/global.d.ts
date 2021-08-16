import {} from "@hapi/hapi";

/**
 * Typescript doesn't allow setting of global variables so easily.
 * This is a workaround (hack). Declare all the extra variables you need here.
 */
declare global {
  namespace NodeJS {
    interface Global {
      // Sentry needs this
      __rootdir__: string;
    }
  }
}
