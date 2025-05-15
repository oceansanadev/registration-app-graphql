const UserModel = require("../../models/User");
const { generateToken } = require("../../helper/token");
const bcrypt = require("bcryptjs");

const User = {
  Query: {
    me: async (parent, args, context) => {
      const user = await UserModel.findUserById(context.user.id);
      return user;
    },
    user: async (parent, args) => {
      const user = await UserModel.findUserById(args.id);
      return user;
    },
    users: async (parent, args) => {
      const users = await UserModel.findAllUsers();
      return users;
    },
  },
  Mutation: {
    register: async (parent, args) => {
      const {
        fullName,
        username,
        email,
        password,
        gender,
        country,
        state,
        languagePreference,
        occupation,
      } = args;

      const existingUser = await UserModel.findUserByEmail(email);

      if (existingUser) {
        throw new Error("User already exists with this email.");
      }

      const languagePrefs = languagePreference || [];

      const newUser = await UserModel.createUser({
        fullName,
        username,
        email,
        password,
        gender,
        country,
        state,
        languagePreference: languagePrefs,
        occupation,
      });

      const token = generateToken(newUser.id);
      return {
        token,
        user: newUser,
      };
    },
    login: async (parent, args) => {
      const result = await UserModel.loginUser(args.email, args.password);
      return {
        token: result.token,
        user: result.user,
      };
    },
  },
};

module.exports = User;
