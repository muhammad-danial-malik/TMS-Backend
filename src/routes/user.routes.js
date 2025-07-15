import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getSingleUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserRole,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizeRole.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

router.use(verifyJWT);
router.route("/logout").post(logoutUser);
router.route("/").get(authorizeRole, getAllUsers);
router.route("/:userId").get(getSingleUser);
router.route("/:userId").delete(authorizeRole, deleteUser);
router.route("/:userId/role").patch(authorizeRole, updateUserRole);

export default router;
