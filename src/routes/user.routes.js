import {Router} from "express";
import registerUser from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount:1
        }
    ]),
    registerUser
)

export default router;

/**register button, filling the details, capturing the details by doing some authentications and validations and checking the size of password and email and all the name and detail after the we will register the user in our databse, here I think we are good to go */