const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cloudinary = require('cloudinary');
require("dotenv").config();
const connectDatabase = require('./config/database');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(cors());
const product = require('./route/product');
const categories = require('./route/categories');
const user = require('./route/user');
const order = require('./route/order');
const payment = require('./route/payment');
cloudinary.config({

  cloud_name: "abmanwolde",
  api_key: "827239376525146",
  api_secret: "qcT03npP3xh4VrLYBBMHuXr2IbQ",
});
app.use('/api', product);
app.use('/api', categories);
app.use('/api', user);
app.use('/api', order);
app.use('/api', payment);

connectDatabase()

// Add routes for managing products, carts, and orders

app.listen(5000, () => {
    console.log('Server listening on port 5000');
});