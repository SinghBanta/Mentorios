/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview-mocker_owner:P0zT2XsdfkMq@ep-withered-union-a5rk5koe.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require'
    }
  };