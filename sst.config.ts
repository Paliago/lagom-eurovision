/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "lagom-eurovision",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-north-1",
        },
      },
    };
  },
  async run() {
    const checkRooms = new sst.aws.Function("CheckRooms", {
      handler: "functions/reflect-rooms.handler",
      url: true,
      environment: {
        REFLECT_API_KEY: process.env.REFLECT_API_KEY,
        REFLECT_ID: process.env.REFLECT_ID,
      },
    });

    const checkRoomContent = new sst.aws.Function("CheckRoomContent", {
      handler: "functions/reflect-content.handler",
      url: true,
      environment: {
        REFLECT_API_KEY: process.env.REFLECT_API_KEY,
        REFLECT_ID: process.env.REFLECT_ID,
      },
    });

    const site = new sst.aws.StaticSite("Euro", {
      environment: {
        VITE_REFLECT_URL: process.env.VITE_REFLECT_URL,
        VITE_BASELIME_API_KEY: process.env.VITE_BASELIME_API_KEY,
      },
      build: {
        command: "npm run build",
        output: "dist",
      },
      domain:
        $app.stage === "production"
          ? {
              name: "lagomeurovision.com",
              aliases: ["www.lagomeurovision.com"],
            }
          : undefined,
    });

    return {
      url: site.url,
      checkRooms: checkRooms.url,
      checkRoomContent: checkRoomContent.url,
    };
  },
});
