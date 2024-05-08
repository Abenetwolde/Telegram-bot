require('dotenv').config();

if (!process.env.PM2_NAME) {
  console.error('⚠️  Missing NAME in .env');
  process.exit();
}

if (!process.env.PM2_PORT) {
  console.error('⚠️  Missing PORT in .env');
  process.exit();
}

module.exports = {
  apps: [{
    name: process.env.PM2_NAME,
    port: process.env.PM2_PORT,
    script: "./index.js",
    watch: true
  }]
};