import jwt from "jsonwebtoken";

// middle where function to decode jwt token to get clerkId
const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login again." });
    }

    const token = authHeader.split(" ")[1];
    const token_decode = jwt.decode(token);
    if (!token_decode?.clerkId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }

    req.clerkId = token_decode.clerkId;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default authUser;
