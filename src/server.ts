// src/server.ts
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import http from "http";

// import mongoClient from "mongodb";
import mongoose from "mongoose";
import globalErrorHandler from "./shared/errors/global_error_handlar";


// import AppError from './shared/errors/app_errors';
// import { StatusCodes } from 'http-status-codes';

// Routen Imports
import AdminRoutes from "./interface/http/routes/adminRoutes";
import UserRouter from "./interface/http/routes/userRoutes";
import ContactMessageRouter from "./interface/http/routes/contactRoutes";
import CommitteeLocationRouter from "./interface/http/routes/committeeLocationRoutes";



// error handlers

// Initialize dotenv for environment variables
dotenv.config();

// Create the Express application
const app: Application = express();

const server = http.createServer(app);



// Middleware
app.use(
  cors({
    origin: [
      "https://softcode-ecommerce.netlify.app",
      "http://localhost:3000",
      "https://3000-firebase-ecommerce-frontend-1750521981814.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev",
      "http://localhost:5173"
    ],
    credentials: true,
  })
); // Enable CORS
app.use(morgan("dev")); // Logging middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON request bodies

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false, // Don’t save the session to the store if it wasn’t modified during the request.
    saveUninitialized: true, // Save a new session even if it hasn't been modified.
  })
);

// Routes
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/contact-message", ContactMessageRouter);
app.use("/api/v1/committee-location", CommitteeLocationRouter);


// app.all("*", (req, res, next) => {
//   throw new AppError(StatusCodes.NOT_FOUND, "Route not found");
// });

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const MONGOURL =
  process.env.MONGO_URL || "mongodb://localhost:27017/miniecoomerce";

mongoose.connect(MONGOURL).then(() => {
  console.log("DB Connected");
  // Start the server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
