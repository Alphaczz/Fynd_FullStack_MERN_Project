import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './db/connectDb.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import userPosts from './routes/userPosts.js';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 10000;

app.use((req, res, next) => {
  res.type('application/javascript');
  next();
});

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS for a specific origin
app.use(cors({
  origin: 'https://threads-46bny2aw7-shivams-projects-d393e6d4.vercel.app',
  credentials: true, // enable set cookie
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", userPosts);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
