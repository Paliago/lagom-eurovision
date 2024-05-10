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
    const site = new sst.aws.StaticSite("Euro", {
      environment: {
        VITE_REFLECT_URL: "https://lagom-euro-paliago.reflect-server.net",
      },
      build: {
        command: "npm run build",
        output: "dist",
      },
      domain: {
        name: "lagomeurovision.com",
        aliases: ["www.lagomeurovision.com"],
      },
    });

    return {
      url: site.url,
    };
  },
});
