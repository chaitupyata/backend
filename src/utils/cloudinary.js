

// File anevi File System through vacchinaye  Server lo Uplode ayyinaye 

// Evaraithe e Service Ni use chestharo LOCAL FILE path ni estharu ante avi Server loki poinaye

// ante SERVER loki ayyithe File vacchindhi SERVER nuchi naku Local path isthavu nenu File ni CLOUDINARY loki uplode chestha 

// STEP 1 => File ni Cloudinary loki uplode cheyyali 

// STEP 2 => Cloudinary loki file uplode ayyinaka SERVER lo vunna File ni delete cheyyali 

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_APY_KEY, 
  api_secret: process.env.CLOUDINARY_APY_SECRET
});


// STEP 2 

// oka method ni create chesi  e method lo parameter lekka e LOCALFILE path ni isthvu danni nenu Uplode chestha 


// A FILE succesfully uplode ayyaka a file ni UNLINK chestha 

const uploadeOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath)  return null 

    // UPLODE the file on Cloudinary 

    const response =  await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    // file has been uploded successfull 

    console.log("FILE IS UPLODED ON CLOUDINARY "),
    response.url();

    return response;

  } catch (error) {

    // removes the locally saved temporary file as the uplode operation got failed
    
    fs.unlinkSync(localFilePath) 
    return null;
  }
}


export { uploadeOnCloudinary }


// NOTE console.log(response) to know what is comming


















