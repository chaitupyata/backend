import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

import {uplode}  from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
  uplode.feilds([
        {
          name: "avatar",
          maxCount: 1
        },
        {
          name: "coverImage",
          maxCount: 1
        }
  ]),
  registerUser
  )

// router.route("/login").post(registerUser)




export default router;