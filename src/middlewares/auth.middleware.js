// TO find the USER is prasent or not 

import  jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async(req, _, next) => {
  
  // Token Access 
  
  
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
    
        if (!token) {
          throw new ApiError(401, "Unauthorized request  ACCESS TOKEN IS NOT THERE ")
        }
  
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
        if (!user) {
          // NEXT_VIDEO: frontEnd
          throw new ApiError(401, "Invalid Access Token: User not found......... ")
        }
  
        req.user = user; 

        next();
  
  } catch (error) {
    let message = "Invalid Access Token";

    // Specific JWT error handling
    if (error.name === 'TokenExpiredError') {
      message = "Access Token expired";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Invalid Access Token signature";
    }

    throw new ApiError(401, message);
  }
})










