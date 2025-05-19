const { rule } = require("graphql-shield");

const allow = rule({ cache: "no_cache" })(
  async (parent, args, ctx, info) => true
);

const isAuthenticated = rule({ cache: "no_cache" })(
  async (parent, args, ctx, info) => {
    if (!ctx.user) {
      return "Permission denied because user not authenticated";
    }

    return true;
  }
);

const hasPermission = (permission) =>
  rule({ cache: "no_cache" })(async (parent, args, ctx, info) => {
    if (!ctx.user) {
      return "Permission denied because user not authenticated";
    }
    if (!ctx.permissions) {
      return "Permission denied because permission not available";
    }

    if (!ctx.permissions.includes(permission)) {
      return "Permission denied because user does not have permission";
    }

    return true;
  });

module.exports = { isAuthenticated, hasPermission, allow };
