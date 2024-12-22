module.exports = {
  treasure: {
    input: "http://localhost:8000/api/v1/openapi",

    output: {
      mode: "single",
      client: "react-query",
      target: "src/gen/endpoints",
      schemas: "src/gen/models",
      baseUrl: "http://localhost:8000",
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "api",
        },
      },
    },
  },
  treasureZod: {
    input: "http://localhost:8000/api/v1/openapi",
    output: {
      mode: "single",
      client: "zod",
      target: "src/gen/endpoints",
      fileExtension: ".zod.ts",
    },
  },
};
