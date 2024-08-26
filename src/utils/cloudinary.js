import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_APY_KEY, 
  api_secret: process.env.CLOUDINARY_APY_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)

        // console.log("RESPONSE::::::: ", response);
        
        return response;



    } catch (error) {

        console.log("Cloudinary UPLODE ERROR: ", error );
        
        // fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

        try {
          fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
          console.log("Local file deleted:", localFilePath);
        } catch (fsError) {
          console.error("Error deleting local file:", fsError);
        }
    
        return null;
    }
}



export {uploadOnCloudinary}