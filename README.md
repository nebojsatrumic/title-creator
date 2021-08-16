## Development quickstart

Clone the repo and run the following commands:

- `npm install` to install project dependencies
- `cp .env.sample .env` to copy environment variables sample (change values after copying)
- `npm run start:clean-web` to build project and start server
  - alternatively `npm run start:clean-mq` to build project and start message queue api that's working with queues

Your server will start running at http://localhost:4100.

Some additional commands that are frequently used in development are:

- `npm test` run unit tests
- `npm test:integration` run integration tests
- `npm run lint` check for lint errors
- `npm run start-web:dev` monitor for any changes and automatically restart the server
- `npm run build` build for production
- `npm start-web` start production ready code

## Environment variables

Environment variables can be used to override the application default configuration.
Common configuration variables are listed here. For all variables see the [.env.sample file](.env.sample)

| Variable                      |             Values              |  Default value  | Description                                                              |
| ----------------------------- | :-----------------------------: | :-------------: | ------------------------------------------------------------------------ |
| NODE_ENV                      | `"development" or "production"` | `"development"` | Specifies the environment in which the service is running                |
| PORT                          |           `<number>`            |     `4000`      | Specifies the port on which the server is running                        |
| MQ_WEB_SERVER_PORT            |           `<number>`            |     `4010`      | Specifies the port on which the web server for MQ is running             |
| DB_HOST                       |           `<string>`            |  `"localhost"`  | Specifies the database hostname                                          |
| DB_PORT                       |           `<number>`            |     `5432`      | Specifies the database port                                              |
| DB_DATABASE                   |           `<string>`            |    `"title"`    | Specifies the database name                                              |
| DB_USER                       |           `<string>`            |    `"user"`     | Specifies the database user                                              |
| DB_PASSWORD                   |           `<string>`            |    `"pass"`     | Specifies the database password                                          |
| LOG_LEVEL                     | `"error","warn","info","debug"` |    `"info"`     | Specifies the severity from most important to least important            |
| TITLE_CREATOR_SERVICE_API_KEY |           `<string>`            |    `1234567`    | Specifies api key used for authenticating requests                       |
| SERVICE_VERSION               |           `<string>`            |    `v1.0.0`     | Specifies version of the service that was deployed                       |
| RMQ_HOST                      |           `<string>`            |   `rabbitmq`    | Specifies the rabbitmq hostname                                          |
| RMQ_PORT                      |           `<number>`            |     `5672`      | Specifies the rabbitmq port                                              |
| PREFETCH_COUNT                |           `<number>`            |      `100`      | Specifies the number of messages to prefetch from rabbitmq               |
| ACK_THROTTLE_TIMEOUT          |           `<number>`            |      `10`       | Specifies the timeout in ms before ack-ing a message consumed from queue |
| CONNECT_RETRY_TIMEOUT         |           `<number>`            |     `1000`      | Specifies the timeout between two connection attempts for rabbitmq       |
| CONNECT_RETRY_COUNT           |           `<number>`            |      `10`       | Specifies the number of retries for connecting to rabbitmq               |
| SERVICE_VERSION               |           `<string>`            |    `v1.0.0`     | Specifies the version of the service that was deployed                   |

## Database migrations

We use sequelize cli (https://github.com/sequelize/cli) for generating and executing database migrations. Make sure you have exported database environment variables when running commands. Commands you will need:

- `npx sequelize db:create` - creates database for new env
- `npx sequelize db:migrate` - Runs pending migrations and saves info about executed migrations in database
- `npx sequelize db:migrate:undo ` - Reverts a migration

## Versioning

We use [SemVer](http://semver.org/) for versioning.
When starting development, create the initial version tag. With each following commit to `master` branch, the minor version will be incremented and the corresponding commit tagged with the new version.
To increment major version, create a new tag manually.

## API documentation

API documentation is generated at [http://localhost:4000/](http://localhost:4000/)

We use [hapi-swagger](https://github.com/glennjones/hapi-swagger) plugin for writing API documentation. API is documented while we are defining the routes.
Tag each route with `tags: ['api']` in order for it to appear in swagger doc.

Example

```js
{
    method: 'GET',
    path: '/health',
    handler: (request, h): string => 'up!',
    options: {
      description: 'Health check if server is up.',
      tags: ['api'],
    },
  },
```

### API versioning

API versioning is handled by Content-Type response header for every route separately. Tag every route that needs to be versioned with `tags: ['api', 'v1']`.

Example

```js
{
    method: 'GET',
    path: '/label',
    handler: controller.getLabelListHandler,
    options: {
      description: 'Get a list of labels by certain criteria.',
      tags: ['api', 'v1'],
    },
  },
```

Response header: `content-type: application/json; version=1; charset=utf-8`
