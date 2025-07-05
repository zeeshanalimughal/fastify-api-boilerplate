const config = {
    schema: "./src/entities/**/*.ts",
    out: "./migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
};
export default config;
