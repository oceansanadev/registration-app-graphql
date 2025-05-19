const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const UserModel = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = (token) => {
  if (!token) {
    console.warn("No token provided");
    return null;
  }
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    return {
      userId: decodedToken.userId,
    };
  } catch (error) {
    console.warn("Invalid or expired token:", error);
    return null;
  }
};

const verifyTokenAndGetUser = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("Decoded token:", decoded);
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
