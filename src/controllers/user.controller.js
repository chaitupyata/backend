import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";




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
      avatar: avatar.url,
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

    if (!username && !email) {
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
          $unset: {
            refreshToken: 1 // this removes the field from document
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


// REFRESH ACCESS TOKEN ENDPOINT *******************


  
  const refreshAccessToken = asyncHandler(async (req, res) => {
  
    // edhi ela refresh avuthundhi Refresh Token NI Pampale
  
    // REFRESH TOKEN ni Cookies tho access cheyyochu 
  
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if (!incomingRefreshToken) {
      throw new ApiError(400, "UnAuthorized Request IncomingRefreshToken is not there")
    }
  
  // Verifying the Tokens ( using jwt )
  try {

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRETE
    )
  
  // Get the User details
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user ) {
      throw new ApiError(401, "Invalid Refresh Token ")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used ") 
    }
  
    const options = {
      httpOnly: true, 
      secure: true
    }
  
    const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken : ", accessToken, options)
    .cookie("refreshToken : ", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken : newrefreshToken},
        "AccessToken Refreshed Successfully... "
      )
    )

} catch (error) {
  throw new ApiError(401, error?.message || "Invalid Refresh Token .........") 
}

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  // User nuchi Current Password ni change cheyyali 

  // ->  User already login a kadha Cookies vunnaya leva ani manam Route ni create chesthunnapdu akkada check chestha Middleware dwara

  // Current Password ni change chesthunnappudu User nuchi em em values tesukutavu anedhi mana istam 

  const {oldPassword, newPassword} = req.body



  // step1: Find the old User 

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password... ")

  }

  // Old password is correct and set the new Password

  user.password = newPassword

  // password ni set chesinavu kani save cheyyaledhu ...

  await user.save({validateBeforeSave: false})

  // send the msg to user that the password succesfully changed 

  return res
  .status(200)
  .json(new ApiError(200, {}, "password changed succesfully"))
})

// Current User ni tesukovali oka End Point ni create cheyyali 


// manam MIDDLEWARE ni pettinamu kabatti andhulo manam user ni mothanni ni 

// req.user loki inject chesinamu 

// If User is LogedIn ayyithe Current user ni return chestha 



const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "Current User Fetched Succesfuly...."))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullName, email} = req.body
  
  // File ni update chesthunnnapudu daniki seperate Controller ni rayali PRODUCTION LEVEL ADVICE 

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required... ")
  }

  // step 1 : Find the user 

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      }
    },  // moonngoDB operater
    {new: true} // update ayyinaka information return avvuthundhi 

  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated Succesfully..."))

})

// UPDATING THE FILES  

// step1: Multer middleware ni pettali (Files ni acccept cheyyadaniki )

// LoginedIn Ayyina valle Update Cheyyali ( middelware ni create cheyyali )


// AVATAR ni Update cheyyali 

const updateUserAvatar = asyncHandler(async (req, res) => {
  
  // multer middleware nuchi req.files vasthaye 

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "AVATAR file is Missing...")    
  }

  // TODO: delete old image - assignment..................


  // CLOUDINARY loki file ni Uplode Cheyyu ....


  const avatar = await uploadOnCloudinary(avatarLocalPath)

  // avatar url ni check cheyyali 

  if (!avatar.url) {
    throw new ApiError(400, " Error while uploding on AVATAR.... Cloudinary....")
  }

  // AVATAR NI UPDATE cheyyali 
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "AVATAR updated succesfully.... ")
  )

})

//   COVER IMAGE ni update cheyyali...

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage File is Missing...")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploding on CoverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res 
  .status(200)
  .json(
    new ApiResponse(200, user, "Cover Image updated Successfully...")
  )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {

  const {username} = req.params 

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing.....");
  }

  // Username nuchi document ni find cheyyali 

  // $match ni vadali edhi motheam document nuchi kavalsindhi find chesthundhi 

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },

    // channel yokkka subscribers entha no find cheyyali 

    // 1st pipeline Subscriber ni Find cheyyadaniki

    {
      $lookup: {
        from: "subscriptions",  // data base lo lowercase and plural avuthundhi 
        localField: "_id",  
        foreignField: "channel",  // channel ni select chesthe Subscribers vasthundhi 
        as: "subscribers"
      }
    },

    // Channel enthamadhi ni subcribe chesindhi  
    // inko pipeline 

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },

    // User Model lo inko 2 Fields ni add chesinamu 

    // edhi aditional fields ni add chesthudhi 

    {
      $addFields: {
        // fielsd nuchi calculate cheyyali  
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
// Button ni SUBSCRIBE OR SUBSCRIBED ani ela chupinchale FrontEnd vallaku 

// True & False batti
        isSubscribed: {
          $cond: {
            if: {
              // medaggaraku vacchina document vundhi kadha andhulo nenu vunnano leno ani 
              $in: [req.user?._id, "$subscribers.subscriber"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,

      }
    }
  ])


  // Console log the channel

  // CHANNEL lo data lekapothe 


  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists.......")
  }

  return res.status(200)
  .json(
    new ApiResponse(200, channel[0], "User channel fetched succesfully...... ")
  )
})

// 6). User watch histrory get cheyadam lookup dwara 


const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "Videos",
        toLocalField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owners",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },

          // Front end ki Array return avuthundhi dhanni manam Object lekka convert chesthunnamu 

          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200, 
      user[0].watchHistory,
      "Watch History fetched Successfully ................."
    )
  )
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory

} 






