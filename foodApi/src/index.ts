
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
import useKpi from './routers/UserKPI';
import feedback from './routers/feedback';
import passport from 'passport';
// import mongoose from 'mongoose';
import path from 'path';
import passportConfig from './passport';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true,}));
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
app.use(passport.initialize());
passportConfig();
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
app.use('/api/kpi', useKpi);
app.use('/api/feedback', feedback);
connectToDatabase()
   
app.listen(7000, () => {
  console.log('Server running on http://localhost:7000/');
}); 
  
 
// mongoose.connection.on('error', (error: Error) => console.log(error));

// app.use('/', router());