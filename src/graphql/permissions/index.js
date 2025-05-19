const { shield, and } = require("graphql-shield");
const { isAuthenticated, hasPermission, allow } = require("./rules");

const PERMISSIONS = {
  VIEW_POSTS: "view_posts",
  VIEW_USERS: "view_users",
  MANAGE_ROLES: "manage_roles",
  MANAGE_USERS: "manage_users",
};

const permissions = shield({
  Query: {
    me: isAuthenticated,
    user: and(isAuthenticated, hasPermission(PERMISSIONS.VIEW_USERS)),
    // post: hasPermission(PERMISSIONS.VIEW_USERS),
    users: hasPermission(PERMISSIONS.VIEW_USERS),
    // "*": allow,
  },
  Mutation: {
    "*": allow,
  },
});

module.exports = { permissions };
