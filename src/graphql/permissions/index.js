const { shield } = require("graphql-shield");
const { isAuthenticated } = require("./rules");

const permissions = shield({
  Query: {
    me: isAuthenticated,
  },
});

module.exports = { permissions };
