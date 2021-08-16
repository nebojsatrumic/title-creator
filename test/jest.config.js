const dotenv = require("dotenv");
const {pathsToModuleNameMapper} = require("ts-jest/utils");
const {compilerOptions} = require("../tsconfig");

dotenv.config({path: "./test/.test.env"});

function checkTestDatabase() {
  if (process.env.DB_DATABASE && !process.env.DB_DATABASE.includes("test")) {
    console.log("You are trying to run tests on a database that doesn't have '_test' in it's name.\n");
    process.exit(1);
  }
}

checkTestDatabase();

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "app"],
  setupFilesAfterEnv: [],
  rootDir: "../",
  testMatch: ["<rootDir>/**/*test.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  verbose: true,
  testTimeout: 20000,
};
