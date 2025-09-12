import { asynchandler } from "../utils/asynchandler";   
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"
export const verifyJWT = asynchandler(async (req, res, next) => {

    // get token from headers
    // check if token is present
    // verify token
    // if verified, get user id from token
    // fetch user from db and attach to req object
    // if any error, throw unauthorized error

   const token= req.cookies?.accessToken || req.headers("Authorization")?.
   replace("Bearer ","") || req.headers("x-access-token");

   if(!token){
    throw new ApiError(401,"Unauthorized, token missing");
   }
   jwt.verify(token, process.env.Access_Token_Secret, async(err, decoded) => {
    if(err){
        throw new ApiError(401,"Unauthorized, token invalid");
    }
    const user = await User.findById(decoded?._id).select('-password -refreshToken -__v');
    if(!user){
        throw new ApiError(404,"User not found");
    }   
    req.user = user;
    next();     
})
});

