import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req, res) => {
  // res.status(200).json({
  //   message: "OK EVERYTHNG FINE"
  // })

  /*
  
  STEP 1 =: Get user details from FrontEnd

  STEP 2 =: validation - not empty

  STEP 3 =: Check if user already exists (username, email)

  STEP 4 =: Check for IMAGES & AVATAR

  STEP 5 =: Uplode them to CLOUDINARY, Check for AVATAR is there or not

  STEP 6 =: Create user object - create entry in DATABASE calls

  STEP 7 =: Remove PASSWORD & REFRESH TOKEN field from RESPONSE

  STEP 8 =: Check for user Creation

  STEP 9 =: return response

  */


   //  STEP 1 =: Get user details from FrontEnd



  const { fullName, email, username, password } = req.body 

  console.log("email: ", email );


  // STEP 2 := validation - not empty


  // if (fullName === "") {
  //   throw new ApiError(400, " fullName are required ")

  // }

  if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

   // STEP 3 =: Check if user already exists (username, email)


  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })
  

  if (existedUser) {
    throw new ApiError(409, "User with email or username is alredy exists")
  }

  // STEP 4 =: Check for IMAGES & AVATAR


  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
    
  }

  //  STEP 5 =: Uplode them to CLOUDINARY, Check for AVATAR is there or not


  const avatar = await uploadeOnCloudinary(avatarLocalPath);

  const coverImage = await uploadeOnCloudinary(coverImageLocalPath);


  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

 //  STEP 6 =: Create user object - create entry in DATABASE calls


  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // const createdUser =  await User.findById(user._id)


  // STEP 7 =: Remove PASSWORD & REFRESH TOKEN field from RESPONSE

  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )


 //   STEP 8 =: Check for user Creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user ")
  }


 //  STEP 9 =: return response


  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Succesfully")
  )









  





  

} )


export { registerUser }



// ASSIGNMENT := 1   console.log()  req.files, req.body, existedUser, 












