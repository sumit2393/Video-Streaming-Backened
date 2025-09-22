import { asynchandler } from "../utils/asynchandler.js";   
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
export const verifyJWT = asynchandler(async (req, res, next) => {

    // get token from headers
    // check if token is present
    // verify token
    // if verified, get user id from token
    // fetch user from db and attach to req object
    // if any error, throw unauthorized error

   const token= 
   req.cookies?.accessToken || 
   req.headers("Authorization")?.replace("Bearer ","") ||
   req.headers("x-access-token");

   if(!token){
    throw new ApiError(401,"Unauthorized, token missing");
   }

   
   const decodeToken=jwt.verify(token,
     process.env.Access_Token_Secret ||"default_access_token_secret");
     
    const user = await User.findById(decodeToken?.id).select
    ('-password -refreshToken -__v');
    if(!user){
        throw new ApiError(404,"User not found");
    }   
    req.user = user;
    next();     
});

