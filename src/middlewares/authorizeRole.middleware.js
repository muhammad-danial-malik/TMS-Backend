import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const allowedRoles = ["admin", "manager"];

const authorizeRole = asyncHandler(async (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "Access denied: insufficient permissions");
  }
  next();
});

export default authorizeRole;
