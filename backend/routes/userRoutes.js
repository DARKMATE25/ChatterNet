// const express = require("express");
import express from 'express';
import { registerUser, authUser, allUsers } from '../controllers/userControllers.js';
import { protect } from '../middlewares/authmiddleware.js';

export const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
