import { asyncHandler } from "../utils/asyncHandler.js";
import UserAccount from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const cookiesOptions = {
  httpOnly: true,
  secure: true,
  path: "/",
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await UserAccount.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens", error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  console.log("email", email);

  // if (fullName === "" || email === "" || username === "" || password === "") {
  //   return apiError(400, "All fields are required");
  // }

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await UserAccount.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "UserAccount already exists with this email or username"
    );
  }

  const user = await UserAccount.create({
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await UserAccount.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, "UserAccount registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await UserAccount.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "UserAccount does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await UserAccount.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .cookie("accessToken", accessToken, cookiesOptions)
    .json(
      new ApiResponse(200, "UserAccount logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await UserAccount.findByIdAndUpdate(
    req.user._Id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("refreshToken", cookiesOptions)
    .clearCookie("accessToken", cookiesOptions)
    .json(new ApiResponse(200, "UserAccount logged out successfully", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await UserAccount.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, cookiesOptions)
      .cookie("accessToken", accessToken, cookiesOptions)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
