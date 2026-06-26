export default () => ({
  app: {
    name: process.env.APP_NAME || "STARLINK MANAGER PRO",
    environment: process.env.NODE_ENV || "development",
    port: Number(process.env.APP_PORT || 4000),
    apiPrefix: "api/v1"
  }
});
