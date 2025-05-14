const bcrypt = require("bcryptjs");
const { users, getNextUserId } = require("../data/users");
const { generateToken } = require("../utils/auth");
const { pool } = require("../db");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      // return users.find((user) => user.id === context.user.id);
      const query = `
        SELECT id, "fullName", username, email, gender, country, state, "languagePreference", occupation
        FROM users
        WHERE id = $1
      `;
      const values = [context.user.id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      const user = result.rows[0];
      user.languagePreference = user.languagePreference || [];
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
      console.log(args);

      const checkQuery = `SELECT * FROM users WHERE email = $1`;
      const checkResult = await pool.query(checkQuery, [email]);
      if (checkResult.rows.length > 0) {
        throw new Error("User already exists with this email.");
      }

      const languagePrefs = languagePreference || [];

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = `
        INSERT INTO users ("fullName", username, email, password, gender, country, state, "languagePreference", occupation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, "fullName", username, email, gender, country, state, "languagePreference", occupation
      `;
      const values = [
        fullName,
        username,
        email,
        hashedPassword,
        gender || null,
        country || null,
        state || null,
        JSON.stringify(languagePrefs), // Insert as JSONB
        occupation || null,
      ];

      const insertResult = await pool.query(insertQuery, values);
      const newUser = insertResult.rows[0];

      console.log(newUser);
      const token = generateToken(newUser.id);
      return {
        token,
        user: newUser,
      };
    },
    login: async (parent, { email, password }) => {
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) {
        throw new Error("No user found with that email.");
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password.");
      }

      const userQuery = `
        SELECT id, "fullName", username, email, gender, country, state, "languagePreference", occupation
        FROM users
        WHERE id = $1
      `;
      const userResult = await pool.query(userQuery, [user.id]);
      const fullUser = userResult.rows[0];
      const token = generateToken(user.id);
      return {
        token,
        user: fullUser,
      };
    },
  },
};

module.exports = resolvers;
