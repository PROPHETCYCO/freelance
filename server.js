//import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectionDB from "./config/db.js";

import authRoutes from "./src/routes/authRoutes.js";

//dotenv.config();

connectionDB();

const app = express();

app.use(cors());
app.use(express.json());


// Auth Routes
app.use('/api/auth', authRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});