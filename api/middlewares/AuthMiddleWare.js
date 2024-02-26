const { verify } = require("jsonwebtoken");
const User=require('../model/user');

const validateToken = async(req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    console.log("Authentication header is not provided")
    return res.json({ error: "Authentication header is not provided" });
  
  }
  const accessToken = header.split("Bearer ")[1];

  if (!accessToken) {
    console.log("Authentication Tokens are not provided" )
    return res.json({ error: "Authentication Tokens are not provided" });
  } else {
    try {
      const validToken = verify(accessToken, process.env.JWT_TOKEN_SECRET_KEY);
      console.log("validToken",validToken)
      const userInfo = await User.findById(validToken.userId);
      console.log("userInfo",userInfo)
      req.user = userInfo;
      if (validToken) {
        return next();
      } else {
        "Unauthorized user!!" 
        return res.status(401).json({ message: 'Unauthorized user!!' });
      }
    } catch (err) {
      return res.json({ error: err.name });
    }
  }
};
const isSuperAdmin = async(req, res, next) => {
  
    try {
      console.log(" User Role: ",req.user.role);
    if (req.user.role === "SUPERADMIN") {
        return next();
    } else {
      return res.status(403).json({ error: "Require SuperAdmin role only!!" });
      }
    } catch (err) {
      return res.json({ error: err.name });
    }
  
};

const isAdminORSuperAdmin = async (req, res, next) => {
  try {
    // console.log(" User Role: ", req.user.role);
    if (req.user.role === "ADMIN" || req.user.role === "SUPERADMIN") {
      return next();
    } else {
      return res.status(403).json({ error: "Require Admin or SuperAdmin role!!" });
    }

  } catch (err) {
    return res.json({ error: err.name });
  }
}

const isYourAccount = async (req, res, next) => {
  try {
    console.log(req.user.id,req.params.id);
    if (req.user.id === req.params.id || req.user.role === "SUPERADMIN") {
      return next();
    } else {
      return res.status(403).json({ error: "Someone can't access someone's Account except SUPER ADMIN" });
    }

  } catch (err) {
    return res.json({ error: err.name });
  }
}



module.exports = { validateToken,isSuperAdmin,isAdminORSuperAdmin,isYourAccount};
