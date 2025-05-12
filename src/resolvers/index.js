const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const { users, getNextUserId } = require("../data/users");
// const { JWT_SECRET } = require("../config");
const { generateToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return users.find((user) => user.id === context.user.id);
    },
  },
  Mutation: {
    register: async (parent, { username, email, password }) => {
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        throw new Error("User already exists with this email.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: getNextUserId(),
        username,
        email,
        password: hashedPassword,
      };
      users.push(newUser);
      const token = generateToken(newUser.id);
      return {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      };
    },
    login: async (parent, { email, password }) => {
      const user = users.find((user) => user.email === email);
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
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    },
  },
};

module.exports = resolvers;
