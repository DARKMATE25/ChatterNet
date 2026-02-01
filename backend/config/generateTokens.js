// import jwt from 'jsonwebtoken';
// export const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.SECRET_KEY, {
//     expiresIn: "10m",
//   });
// };

import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
