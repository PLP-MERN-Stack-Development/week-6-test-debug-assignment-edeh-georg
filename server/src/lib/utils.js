import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'my-test-secret_key';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d"
  });
};

export const setTokenCookie = (res, token) => {
  if (res && typeof res.cookie === 'function') {
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });
  }
};

export const generateTokenAndSetCookie = (userId, res) => {
  const token = generateToken(userId);
  setTokenCookie(res, token);
  return token;
};

export const getRandomInt = (min = 1, max = 100) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};