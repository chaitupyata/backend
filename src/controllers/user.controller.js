import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



// STEP 5 :=  ACCESS & REFRESH TOKEN  METHOD

const generateAccessAndRefreshTokens = async(userId) => {
  try {

  // Find the User 
      const user =  await User.findById(userId);

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

// ACCESSTOKEN is send to user , but REFRESHTOKEN is Stored in DATABASE 


// STORING the Refresh Token in DATABASE


    user.refreshToken = refreshToken

// SAVE in database :=

    await user.save({validateBeforeSave : false})


// Returning the ACCESS & REFRESH TOKEN 


    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Refresh & Access Token")
  }
}


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


// LOGIN USER **********

    const loginUser = asyncHandler(async (req, res) => {

      // STEP 1 := req body -> data

      // STEP 2 := username  or email is prasent or not 

      // STEP 3 := FIND the User

      // STEP 4 := Password check

      // STEP 5 :=  ACCESS & REFRESH TOKEN 

      // STEP 6 := send cookie 

// STEP 1 := req body -> data

    const { email, username, password } = req.body

    if (!username || !email) {
      throw new ApiError(400, "username or email is required !!!!!!")
    }

// STEP 2 := username  or email is prasent or not 

    const user = await User.findOne({
      $or: [{ username }, { email }]
    })

// STEP 3 := FIND the User

    if (!user) {
      throw new ApiError(404, "User does not exist......")

    }

// STEP 4 := Password check


    const isPasswordValid =  await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
      throw new ApiError(401, "Password inCorrect...... ")
    }

// STEP 5 :=  ACCESS & REFRESH TOKEN 


    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // BEACUSE ACCESS & REFRESH TOKEN is called mutliple times then it commenly creates a METHOD from them 


// STEP 6 := send cookie 


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"

      )
    )
})


// LOGOUT USER ::::::::=================


    const logoutUser = asyncHandler(async(req, res) => {

      //  STEP 1 := Find the User 
      
      //  STEP 2 :=  Cleare the Cookies of user 

      //  STEP 3 := Reset the REFRESH TOKEN 

      
//  STEP 1 := Find the User 
  

      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: undefined
          }
        },
        {
          new: true
        }
      )

      const options = {
        httpOnly: true,
        secure: true
      }

//  STEP 2 :=  Cleare the Cookies of user 

      return res 
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiError(200, {}, "User logged Out SuccessFully"))

    })

export {
  registerUser,
  loginUser,
  logoutUser

}








