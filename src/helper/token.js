const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const UserModel = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
};

const verifyTokenAndGetUser = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findUserById(decoded.id);
    if (!user) {
      console.warn("Token valid but user not found");
    }
    return user;
  } catch (error) {
    console.warn("Invalid or expired token:", error);
    return null;
  }
};

module.exports = { generateToken, verifyToken, verifyTokenAndGetUser };
