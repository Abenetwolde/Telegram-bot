
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
const cloudinary = require('cloudinary');
import { connectToDatabase } from '../config/db';
import user from "./routers/user"
import product from './routers/product';
import category from './routers/category';
import order from './routers/order';
import payment from './routers/payment';
// import mongoose from 'mongoose';
import path from 'path';
 
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('uploads'));

cloudinary.config({
  cloud_name: "abmanwolde",
  api_key: "827239376525146",
  api_secret: "qcT03npP3xh4VrLYBBMHuXr2IbQ",
});
app.use('/api/user', user);
app.use('/api/product', product);
app.use('/api/category', category);
app.use('/api/order', order);
app.use('/api/payment', payment);
connectToDatabase()
  
app.listen(8000, () => {
  console.log('Server running on http://localhost:8080/');
});
 
 
// mongoose.connection.on('error', (error: Error) => console.log(error));

// app.use('/', router());