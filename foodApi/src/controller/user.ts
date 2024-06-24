import express, { Request, Response } from 'express';

import User, { IUser } from '../model/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Document, Types } from 'mongoose';
exports.createUser = async (req: Request, res: Response) => {
    console.log("hit the create user api")

    try {
        let user = await User.findOne({ telegramid: req.body.telegramid });
        if (user) {
            return res.json({ token: user.token, message: 'User already registered.' });

        } else {
            const telegramId = req.body.telegramid
            const token = jwt.sign(
                { userId: telegramId },
                process.env.JWT_TOKEN_SECRET_KEY || "abnet",
                { expiresIn: "7d" }
            );
            // const token = jwt.sign({ telegramId }, 'your_secret_key');
            user = new User(req.body)
           
           
            user = await user.save();

            res.status(201).json({
                success: true,
                user
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error!' });
    }

};
exports.getUserDetails = async (req: Request, res: Response) => {
    console.log("hit the getUserDetails user api")

    try {
        const user = await User.findOne({ telegramid: req.params.telegramid });
        if (user) {
             res.status(200).json({
                success: true,
                user,
            });
        } else {
            res.status(500).json({
                success: false,
                message: "user not found!"
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error!' });
    }


}
exports.updateUserDetails = async (req: Request, res: Response) => {
    console.log("hit the updateUserDetails user api", req.body)

    try {
        let user = await User.findOne({ telegramid: parseInt(req.params.telegramid)});
        console.log("User.$where..........", user)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
   
       const  muser = await User.findOneAndUpdate({ telegramid: parseInt(req.params.telegramid) },
         { ...req.body} ,{ new: true });
      console.log("msuser",muser)
       
        if (!muser) {
            return res.status(400).json({ success: false, message: 'User update failed!' });
        }

        res.status(200).json({
            success: true,
            user:muser
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }


}
exports.deleteAuser = async (req: Request, res: Response) => {
    console.log("hit the delete user api")
    try {
        let user = await User.findOne({ telegramid: req.params.telegramid });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        user = await User.findByIdAndDelete(user._id).lean();

        if (!user) {
            return res.status(400).json({ success: false, message: 'User deletion failed!' });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully!'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }


}
export const getAllAuser = async (req: Request, res: Response) => {
    console.log("hit the get all user api");
    try {
        // Parse the query parameters
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.search ? req.query.search.toString() : '';
        const sortField = req.query.sortField ? req.query.sortField.toString() : 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const joinMethod = req.query.joinMethod ? req.query.joinMethod.toString() : '';

        // Calculate the number of users to skip
        const skip = (page - 1) * pageSize;

        // Build the query object
        let query: any = {};
        if (search) {
            query.first_name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (joinMethod) {
            query.from = joinMethod;
        }

        // Build the sort object
        const sort: any = {};
        sort[sortField] = sortOrder;

        // Fetch the users with pagination, search, and sorting
        const users = await User.find(query).sort(sort).skip(skip).limit(pageSize);
        const count = await User.countDocuments(query);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / pageSize);

        res.status(201).json({
            success: true,
            users,
            count,
            page,
            pageSize,
            totalPages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
}
interface NewUserCount {
    _id: string;
    frombotcount: number;
    fromchannelcount: number;
    total: number;
}
export const NewuserCustomRange = async (req: Request, res: Response): Promise<void> => {
    console.log("range")
    console.log(JSON.stringify(req.body,null,"\t")+"date")
    try {
        // Extract start and end dates from request body
        const { startDate, endDate } = req.body;

        // Query the database to find all users created within the specified date range
        const newUserCounts = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
            },
            {
                $sort: { "_id": 1 } // Sort by the newly added monthDate field in ascending order
            }
        ]).limit(200);

        // Format the response with counts for each date
        const formattedCounts = newUserCounts.map(({ _id, newUserCounts }) => {
            const counts: any = { frombotcount: 0, fromchannelcount: 0, frominvitation: 0 };
            newUserCounts.forEach(({ from, count }: any) => {
                if (from === 'BOT') {
                    counts.frombotcount += count;
                } else if (from === 'CHANNEL') {
                    counts.fromchannelcount += count;
                } else if (from === 'INVITATION') {
                    counts.frominvitation += count;
                }
            });
            counts.total = (counts.frombotcount || 0) + (counts.fromchannelcount || 0) + (counts.frominvitation || 0);
            return { _id, ...counts };
        });

        const totalUsers = formattedCounts.reduce((total, item) => total + (item.total || 0), 0);

        // Send the response containing the number of new users joined per date
        res.json({ newUserCounts: formattedCounts ,totalUsers});
    } catch (error) {
        // Handle errors
        console.error('Error fetching new users per date:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const NewuserDaily = async (req: Request, res: Response): Promise<void> => {
    console.log("test users link" )
    try {

        const { interval = 'perMonth' } = req.query;
console.log(interval)
        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perWeek':
                // Calculate the start of the current week (Sunday)
                startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
                startDate.setUTCHours(0, 0, 0, 0);
                // Calculate the end of the current week (Saturday)
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Move to Saturday
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perMonth':
                // Calculate the start and end of the current month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perYear':
                // Calculate the start and end of the current year
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perDay':
            default:
                // Default to per day, use the current date
                startDate = new Date(currentDate);
                endDate = new Date(currentDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
        }

        // Query the database to find all users created within the specified interval
        let newUserCounts = [];

if(interval==="perWeek"||interval==="perMonth"){
        // Query the database to find all users created within the specified interval
         newUserCounts = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%d-%m", date: "$createdAt" } },
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
            },
            { $sort: { "_id": 1 } }
            
        ])
    }else if(interval === "perYear"){
         newUserCounts = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Format to YYYY-MM
                        from: "$from"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    newUserCounts: {
                        $push: {
                            from: "$_id.from",
                            count: "$count"
                        }
                    }
                }
            },
   
    { $sort: { "_id": 1 } }
       
            
            
        ]);
    }else if (interval === "perDay") {
        newUserCounts = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$createdAt" },
                        from: "$from"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.hour",
                    newUserCounts: {
                        $push: {
                            from: "$_id.from",
                            count: "$count"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: {
                        $cond: [
                            { $gte: ["$_id", 12] },
                            { $concat: [{ $substr: ["$_id", 0, -2] }, " PM"] },
                            { $concat: [{ $substr: ["$_id", 0, -2] }, " AM"] }
                        ]
                    },
                    newUserCounts: 1
                }
            }
        ]);
    }
        // Format the response with counts for each date
        const formattedCounts = newUserCounts.map(({ _id, newUserCounts }) => {
            const counts:any = { frombotcount: 0, fromchannelcount: 0 ,frominvitation:0};
            newUserCounts.forEach(({ from, count }:any) => {
                if (from === 'BOT') {
                    counts.frombotcount += count;
                } else if (from === 'CHANNEL') {
                    counts.fromchannelcount += count;
                }
                else if (from === 'INVITATION') {
                    counts.frominvitation += count;
                }
            });
            counts.total = (counts.frombotcount || 0) + (counts.fromchannelcount || 0) + (counts.frominvitation || 0);
            return { _id, ...counts };
        });
        const totalUsers = formattedCounts.reduce((total, item) => total + (item.total || 0), 0);

        // Send the response containing the number of new users joined per date
        res.json({ newUserCounts: formattedCounts ,totalUsers});
    } catch (error) {
        // Handle errors
        console.error('Error fetching new users per date:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const LanguagePreferance = async (req: Request, res: Response): Promise<void> => {
    console.log("language users link" )
    try {

       // Count users for each language
    const languageStats: { [key: string]: { count: number, percentage: number } } = {};

    const totalCount = await User.countDocuments();

    const usersByLanguage = await User.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]);

    usersByLanguage.forEach((language: { _id: string, count: number }) => {
      const percentage = (language.count / totalCount) * 100;
      languageStats[language._id] = { count: language.count, percentage };
    });

    // Return the language statistics
    res.json(languageStats)
    } catch (error) {
        // Handle errors
        console.error('Error fetching new users per date:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.AddsFavorite = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.favorites.push(req.body.productId);
        await user.save();
        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ error: "server error" });
    }
};
exports.RemovesFavorite = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.favorites = user.favorites.filter((fav) => fav.toString() !== req.params.productId);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "server error" });
    }
};
exports.adminLogin = async (req: Request, res: Response) => {
    console.log("hit the adminlogin api")
    try {
        const { email, password } = req.body;
        const query = { email: email };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ message: "User Doestn't Exist. Try Sign Up!" });
        }

        if (user && await bcrypt.compare(password, user.password)) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.JWT_TOKEN_SECRET_KEY || "abnet",
                {
                    expiresIn: "1d",
                }
            );

            await User.findOneAndUpdate(
                { email: email },
                { token: token },
                { new: true }
            );
            return res.status(200).json({ User: user });
        }
        res.status(400).send("Invalid Credentials");
    } catch (error) {
        return res.status(500).send({ message: error });
    }
}

exports.adminCreate = async (req: Request, res: Response) => {
    console.log("hit the admin create api")
    let userData = req.body;
    try {
        const { email, password } = req.body;

        const phoneORemailExist = await User.findOne({
            email: email
        });
    
        if (phoneORemailExist) {
            return res
                .status(400)
                .send({ message: "PHONE_EMAIL_ALREADY_EXISTS_ERR" });
        }
    
        const encryptedPassword = await bcrypt.hash(password, 10);
        userData.password = encryptedPassword;
    
        const newUser = await User.create(userData);
        console.log(newUser)
        const token = jwt.sign(
            { user_id: newUser._id, email },
            process.env.JWT_TOKEN_SECRET_KEY || "abnet",
            {
                expiresIn: "999d",
            }
        );
        newUser.token = token;
        res
            .status(201)
            .send({
                user: newUser,
                message: "Account Created Saved Succesfully !",
            });
    } catch (error) {
        res
      
        .send({
            message: "Internal Error !",
        }); 
    }
  

}


