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
        VITE_REFLECT_URL: process.env.VITE_REFLECT_URL,
        VITE_BASELIME_API_KEY: process.env.VITE_BASELIME_API_KEY,
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
