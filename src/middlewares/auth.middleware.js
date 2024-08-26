// TO find the USER is prasent or not 

import  jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.models";


export const verifyJWT = asyncHandler(async(req, _, next) => {
  
  // Token Access 

  try {
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
        if (!token) {
          throw new ApiError(401, "Unauthorized request ")
        }
  
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRETE)
  
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
        if (!user) {
          // NEXT_VIDEO: frontEnd
          throw new ApiError(401, "Invalid Access Toke ")
        }
  
        req.user = user; 

        next()
  
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  
  }
})










