import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const {fullName, email, username, password } = req.body
  // console.log("email: ", email);
  // console.log("fullName: ", fullName);
  // console.log("username: ", username);
  // console.log("password: ", password);

  // if (
  //     [fullName, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //     throw new ApiError(400, "All fields are required")
  // }

  if (fullName === "") {
    throw new ApiError(400, "FullName is required")
  }
  if (email === "") {
    throw new ApiError(400, "Email is required")
  }
  if (password === "") {
    throw new ApiError(400, "Password is required")
  }
  if (username === "") {
    throw new ApiError(400, "Username is required")
  }


  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })
  

  
  
  
  
  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }

  // console.log("existedUser : ",existedUser);


  // console.log("req.files :: ",req.files);

  // Ensure files exist and are in the expected format
// const avatarFile = req.files?.avatar?.[0];
// const coverImageFile = req.files?.coverImage?.[0];


// console.log("avatarFile : ",avatarFile);
// console.log("coverImageFile : ",coverImageFile);



    // Extract local paths for avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
      coverImageLocalPath = req.files.coverImage[0].path
    }

    // Check if avatar file exists, otherwise throw error
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required to local path");
    }


  /*
  

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required to local path")
  }
*/



  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
      throw new ApiError(400, "Avatar file is required to uplode on cloudinary")
  }


  const user = await User.create({
      fullName,
      avatar: avatar?.url || "",
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )

} )


export {registerUser}