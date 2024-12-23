module.exports = {
  treasure: {
    input: "https://treasure-api-production.up.railway.app/api/v1/openapi",

    output: {
      mode: "single",
      client: "react-query",
      target: "src/gen/endpoints",
      schemas: "src/gen/models",
      baseUrl: "https://treasure-api-production.up.railway.app",
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "api",
        },
      },
    },
  },
  treasureZod: {
    input: "https://treasure-api-production.up.railway.app/api/v1/openapi",
    output: {
      mode: "single",
      client: "zod",
      target: "src/gen/endpoints",
      fileExtension: ".zod.ts",
    },
  },
};
