const User = require("./resolvers/user");

const Getresolvers = () => {
  const Resolvers = [User];
  return Resolvers;
};

module.exports = {
  Getresolvers,
};
