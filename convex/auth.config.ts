const authConfig = {
  providers: [
    {
      domain: process.env.NODE_ENV === 'production'
        ? "https://preuastral.clerk.com" // Production domain
        : "https://preuastral.clerk.accounts.dev", // Development domain
      applicationID: 'convex',
    },
  ],
};

export default authConfig;
