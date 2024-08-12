const mongoose = require('mongoose');
// require('dotenv').config();

const MONGO_URI= 'mongodb+srv://abnet:80110847@cluster0.hpovgrl.mongodb.net/?retryWrites=true&w=majority'
const connectDatabase = (retryAttempts = 5, retryInterval = 5000) => {
    let attempts = 0;
 
    const connectWithRetry = () => {
        mongoose.connect(MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => { 
            console.log("Mongoose Connected");
        })
        .catch((error) => {
            console.error("MongoDB Connection Error:", error.message);
            if (attempts < retryAttempts) {
                attempts++;
                console.log(`Retrying connection (${attempts}/${retryAttempts})...`);
                setTimeout(connectWithRetry, retryInterval);
            } else {
                console.error(`Maximum retry attempts (${retryAttempts}) reached. Exiting...`);
                process.exit(1); // Exit the application on connection failure after maximum attempts
            }
        });
    };

    connectWithRetry();
};

 
module.exports = connectDatabase;