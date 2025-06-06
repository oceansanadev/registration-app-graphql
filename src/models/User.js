const bcrypt = require("bcryptjs");
const { pool } = require("../config/postgres");
const { generateToken } = require("../helper/token");

const createUser = async ({
  fullName,
  username,
  email,
  password,
  gender = null,
  country = null,
  state = null,
  languagePreference = [],
  occupation = null,
}) => {
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
    gender,
    country,
    state,
    JSON.stringify(languagePreference),
    occupation,
  ];
  const result = await pool.query(insertQuery, values);
  return result.rows[0];
};

// Find user by email:
const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = `
    SELECT id, "fullName", username, email, gender, country, state, "languagePreference", occupation
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
};

const findAllUsers = async () => {
  const query = `
  SELECT * FROM users
  `;
  const result = await pool.query(query);
  return result.rows;
};

const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
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
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  loginUser,
};
