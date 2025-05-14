const User = require("./schema/user");

const GetTypeDef = () => {
  const TypeDefs = [User];
  return TypeDefs;
};

module.exports = {
  GetTypeDef,
};
