const authConfig = {
  providers: [
    {
      domain: process.env.next_public_clerk_frontend_api_url,
      applicationID: 'convex',
    },
  ],
};

export default authConfig;
