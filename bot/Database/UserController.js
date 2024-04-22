// const User = require('../Model/user');
const Users = require('../Model/user')
const jwt = require("jsonwebtoken");
const connectDatabase = require('../config/database');

async function createUser(data) {


  try {

    let user = await Users.findOne({ telegramid: data.telegramid });

    if (user) {
      return { token: user.token,  userid: user._id,message: 'User already registered.' };
    } else {
      const token = jwt.sign(
        { userId: data.telegramid },
        process.env.JWT_TOKEN_SECRET_KEY || "hfjkdhjkhsjdkghjkd",
        { expiresIn: "7d" }
      );

      user = await new Users({
        telegramid: data.telegramid,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        is_bot: data.is_bot,
        language:data.language,
        token: token,
      });
    
      user = await user.save();

      return { success: true, user };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function getAllUser() {
  try {
    const user = await Users.find({}).sort({createdAt:-1});

    if (user) {
   
      return { success: true, users: user };
    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function updateUserLanguage(telegramId, language) {
  try {
    const user = await Users.findOne({ telegramid: telegramId });

    if (user) {
      // Update the user's language
      user.language = language;
      await user.save();
      return { success: true, message: 'User language updated successfully' };
    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function NewUser(telegramId, language) {
  try {
    // Get the current date
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    // Calculate the start and end of the current month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    endOfMonth.setUTCHours(23, 59, 59, 999);

    // Query the database to find all users created between the start and end of the month
    const newUserCounts = await Users.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    from: "$from"
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.date",
                newUserCounts: {
                    $push: {
                        from: "$_id.from",
                        count: "$count"
                    }
                }
            }
        }
    ]);

    // Format the response with counts for each date
    const formattedCounts = newUserCounts.map(({ _id, newUserCounts }) => {
        const counts= { frombotcount: 0, fromchannelcount: 0 };
        newUserCounts.forEach(({ from, count }) => {
            if (from === 'BOT') {
                counts.frombotcount+= count;
            } else if (from === 'CHANNEL') {
                counts.fromchannelcount += count;
            }
        });
        counts.total = (counts.frombotcount || 0) + (counts.fromchannelcount || 0);
        return { _id, ...counts };
    });

    // Get date range within the current month
    const dateRange = getDatesWithinRange(startOfMonth, endOfMonth);

    // Merge counts with date range to fill in missing dates with count 0
    const mergedCounts = mergeCounts(dateRange, formattedCounts);

    // Send the response containing the number of new users joined per date
 return({ newUserCounts: mergedCounts });
} catch (error) {
    // Handle errors
    console.error('Error fetching new users per date:', error);
    res.status(500).json({ message: 'Internal server error' });
}
}
function getDatesWithinRange(startDate, endDate) {
  const dateRange= [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
      dateRange.push(currentDate.toISOString().slice(0, 10)); // Store date in "YYYY-MM-DD" format
      currentDate.setDate(currentDate.getDate() + 1); // Increment current date by 1 day
  }
  return dateRange;
}

// Function to merge counts with date range
function mergeCounts(dateRange ,counts) {
  const mergedCounts = [];
  for (const date of dateRange) {
      const count = counts.find((entry) => entry._id === date);
      if (count) {
          mergedCounts.push(count);
      } else {
          mergedCounts.push({ _id: date, frombotcount: 0, fromchannelcount: 0, total: 0 });
      }
  }
  return mergedCounts;
}
module.exports = {
  createUser,
  updateUserLanguage,
  NewUser,
  getAllUser
  // Add other database functions related to the User model here
};
