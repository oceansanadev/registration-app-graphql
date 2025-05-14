const UserModel = require("../../models/User");
const { generateToken } = require("../../helper/token");
const bcrypt = require("bcryptjs");

const User = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const user = await UserModel.findUserById(context.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
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
    login: async (parent, { email, password }) => {
      const user = await UserModel.findUserByEmail(email);
      if (!user) {
        throw new Error("No user found with that email.");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password.");
      }

      const token = generateToken(user.id);
      return {
        token,
        user,
      };
    },
  },
};

module.exports = User;
