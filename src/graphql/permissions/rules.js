const { rule } = require("graphql-shield");

const isAuthenticated = rule({ cache: "no_cache" })(
  async (parent, args, context) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }
    return true;
  }
);

module.exports = { isAuthenticated };
