// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//   try {
    
//     // mongoDB manaki retun ga oka OBJECT ni esthundhi kabatti danni store chesinamu

//     // ante connection ayyinaka manaki response isthundhi mongoDB

//     const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
//     console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`);
    
//     // console.log(connectionInstant);
    


//   } catch (error) {
//     console.log("MONGODB connection errror ", error);
//     process.exit(1)
//   }
// }

// export default connectDB




// // NOTE : 1 = connecctionInstance ni "console log() cheyyu "









import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB




