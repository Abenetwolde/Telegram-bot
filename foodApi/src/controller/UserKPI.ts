import { Request, Response } from 'express';

import UserKPI from '../model/UserKpi';
import KpiProducts from '../model/KpiProduct';
import KpiCategorys from '../model/KpiCategory';
import User from '../model/user.model';
import clickKpi from '../model/UserClicks';
import { userInfo } from 'os';
import Order from '../model/order.model';


export const GetUSerSpentTime = async (req: Request, res: Response) => {
    console.log("reach user kpi ")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }
        let results = []
        if (interval === "perWeek" || interval === "perMonth") {
            results = await UserKPI.aggregate([
                { $unwind: '$scene' }, // Unwind the scene array
                {
                    $match: {
                        'scene.date': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$scene.date" } },

                        },
                        totalDuration: {
                            $sum: {
                                $add: [
                                    { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                    { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                    { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: "$_id.date",
                        totalDurationInMinutes: { $divide: ['$totalDuration', 60] }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }

            ]);
        } else if (interval === "perYear") {
            results = await UserKPI.aggregate([
                { $unwind: '$scene' }, // Unwind the scene array
                {
                    $match: {
                        'scene.date': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m", date: "$scene.date" } },

                        },
                        totalDuration: {
                            $sum: {
                                $add: [
                                    { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                    { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                    { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: "$_id.date",

                        totalDurationInMinutes: { $divide: ['$totalDuration', 60] }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }

            ]);
        }
        const totalDurationInMinutes = results.reduce((total, result) => total + result.totalDurationInMinutes, 0);
        console.log(JSON.stringify(results))
        if (!results || results.length == 0) {
            return res.status(404).json({ userTime: [], totalDurationInMinutes: 0 });
        }
        res.json({ userTime: results, totalDurationInMinutes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const dateRangeSpentTime = async (req: Request, res: Response) => {
    console.log("range user kpi ")
    try {
        let results: any = []
        const { startDate, endDate } = req.body;
        console.log("range user kpi " + startDate)
        results = await UserKPI.aggregate([
            { $unwind: '$scene' }, // Unwind the scene array
            {
                $match: {
                    "scene.date": { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$scene.date" } },

                    },
                    totalDuration: {
                        $sum: {
                            $add: [
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$_id.date",

                    totalDurationInMinutes: { $divide: ['$totalDuration', 60] }
                }
            },
            {
                $sort: { "_id": 1 }
            }


        ]);
        // console.log(JSON.stringify(results[0].totalUserTime[0].totalDurationInMinutes));
        // res.json({ userTime: results[0].userTime, totalUserTime: results[0]?.totalUserTime[0]?.totalDurationInMinutes })
        const totalDurationInMinutes: any = results.reduce((total: any, result: any) => total + result.totalDurationInMinutes, 0);
        console.log(JSON.stringify(results))
        res.json({ userTime: results, totalDurationInMinutes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};

export const spendTimePerScene = async (req: Request, res: Response) => {
    console.log("spendTimePerScene user kpi ")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }

        const results = await UserKPI.aggregate([
            { $unwind: '$scene' }, // Unwind the scene array
            {
                $match: {
                    'scene.date': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
                }
            },
            {
                $group: {
                    _id: '$scene.name',
                    totalDuration: {
                        $sum: {
                            $add: [
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    sceneName: '$_id',
                    totalDurationInMinutes: { $divide: ['$totalDuration', 60] } // Convert total duration to minutes
                }
            }
        ]);

         res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const totalNumberofClicks = async (req: Request, res: Response) => {
    console.log("totalNumberofClicks user kpi ")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }
        let totalProductClicksResult: any = null;


        if (interval === "perWeek" || interval === "perMonth") {
            totalProductClicksResult = await clickKpi.aggregate(

                [
                    { $unwind: '$clicks' },
                    {
                        $match: {
                            'clicks.date': { $gte: startDate, $lte: endDate }
                        }
                    },

                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$clicks.date" } },
                            totalProductClicks: { $sum: '$clicks.count' }
                        }
                    },
                    {
                        $sort: {
                            "_id": 1 // Sort the dates in ascending order
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalClicks: { $sum: '$totalProductClicks' }, // Sum of totalProductClicks
                            clicksByDate: { $push: { date: '$_id', totalProductClicks: '$totalProductClicks' } }
                        }
                    },

                    {
                        $project: {
                            _id: 0, // Exclude the _id field
                            totalClicks: 1,
                            clicksByDate: 1
                        }
                    }

                ]
            )


        } else if (interval === "perYear") {
            totalProductClicksResult = await clickKpi.aggregate([
                {
                    $match: {
                        'clicks.date': { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $unwind: '$clicks'
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$clicks.date" } },
                        totalProductClicks: { $sum: '$clicks.count' }
                    }
                },
                {
                    $sort: {
                        "_id": 1 // Sort the dates in ascending order
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalClicks: { $sum: '$totalProductClicks' }, // Sum of totalProductClicks
                        clicksByDate: { $push: { date: '$_id', totalProductClicks: '$totalProductClicks' } }
                    }
                },

                {
                    $project: {
                        _id: 0, // Exclude the _id field
                        totalClicks: 1,
                        clicksByDate: 1
                    }
                }
            ]);


        }

        res.json({
            // totalClicks: sum,
            clicksByDate: totalProductClicksResult
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const getUsersJoinedByMethodPerTimeInterval = async (req: Request, res: Response) => {
    console.log("getUsersJoinedByMethodPerTimeInterval user kpi ")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }




        let result = await User.aggregate([
            {
                $match: {
                    'createdAt': { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$from',
                    count: { $sum: 1 },
                },
            },
        ]);







        console.log("result", result)
        // Create an array of objects containing sorted dates and total clicks
        const formattedResult = result.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {});

console.log(formattedResult)
        // Send the combined JSON response
        res.json({
            formattedResult
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const GetTimeSpentPerScene = async (req: Request, res: Response) => {
    console.log("GetTimeSpentPerScene user kpi ")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }



        const results = await UserKPI.aggregate([
            { $unwind: '$scene' }, // Unwind the scene array
            // { $match: { 'scene.date': { $gte: startDate, $lte: endDate } } }, // Filter based on the calculated start and end dates
            {
                $group: {
                    _id: {
                        telegramid: '$telegramid',
                        sceneName: '$scene.name'
                    },
                    totalDuration: {
                        $sum: {
                            $add: [
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                            ]
                        }
                    }
                }
            },

            {
                $group: {
                    _id: '$_id.telegramid', // Group by telegramId
                    totalSpentTimeInSeconds: { $sum: '$totalDuration' },// Total spent time by each user
                    scenes: {
                        $push: {
                            sceneName: '$_id.sceneName',
                            totalDuration: { $divide: ['$totalDuration', 60] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalSpentTimeInMinutes: { $divide: ['$totalSpentTimeInSeconds', 60] } // Convert total duration to minutes
                }
            },
            {
                $unset: 'totalSpentTimeInSeconds' // Remove the totalSpentTimeInSeconds field
            },
            {
                $sort: {
                    totalSpentTimeInMinutes: -1 // Sort in ascending order
                }
            }

        ]);
        const mappedResults = await Promise.all(results.map(async (result: any) => {
            // Find user information
            const user = await User.findOne({ telegramid: result._id }).select('telegramid first_name username');;

            return {
                ...result,
                user
            };
        }));

        res.json({ timeSpentPerScene: mappedResults });







    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};

export const getUserTotalClicksPerName = async (req: Request, res: Response) => {
    console.log("getUserTotalClicksPerName")
    try {
        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }



        const results = await clickKpi.aggregate([
            { $unwind: '$clicks' },
            { $match: { 'clicks.date': { $gte: startDate, $lte: endDate } } },
            {
                $lookup: {
                    from: 'users', // Use the name of your user collection
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            }, // Filter based on the calculated start and end dates
            {
                $group: {
                    _id: {
                        telegramid: '$telegramid',
                        sceneName: '$clicks.name'
                    },
                    totalClicks: { $sum: '$clicks.count' },
                    userInfo: { $first: '$userInfo' }, // Preserve user information
                },
            },
            {
                $group: {
                    _id: '$_id.telegramid',

                    userClicks: {
                        $push: {
                            sceneName: '$_id.sceneName',
                            totalClicks: '$totalClicks',
                        },
                    },
                    totalClicks: { $sum: '$totalClicks' },
                    userInfo: { $first: '$userInfo' }, // Preserve user information
                },
            },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    telegramid: '$_id', // Project name field
                    userinformationperScene: '$userClicks', // Rename userClicks to user
                    totalClicks: 1,
                    userInfo: '$userInfo', // Preserve user information
                },

            },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    telegramid: 1, // Project name field
                    userinformationperScene: 1, // Rename userClicks to user
                    totalClicks: 1,
                    userInfo: { $arrayElemAt: ['$userInfo', 0] },
                },

            },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    telegramid: 1, // Project name field
                    userinformationperScene: 1, // Rename userClicks to user
                    totalClicks: 1,
                    userInformation: { _id: '$userInfo._id', telegramid: '$userInfo.telegramid', username: '$userInfo.username', first_name: '$userInfo.first_name' },
                },

            },
            {
                $sort: {
                    totalClicks: -1 // Sort in ascending order
                }
            }

        ]);
        const mappedResults = await Promise.all(results.map(async (result: any) => {
            // Find user information
            const user = await User.findOne({ telegramid: result.telegramid }).select('telegramid first_name username');;

            return {
                ...result,
                user
            };
        }));

        res.json({ timeSpentPerScene: results });







    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};

export const getUsersPerformance = async (req: Request, res: Response) => {
    console.log("getUsersPerformance")
    try {
        const { interval = 'perMonth' } = req.query;
        let usertimedata: any = []
        let userclickdata: any = []
        let userorderdata: any = []
        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
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

        }

        const results: any = await UserKPI.aggregate([
            {
                $unwind: '$scene'
            },
            {
                $match: {
                    'scene.date': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
                }
            },
            {
                $group: {
                    _id: '$user', // Group by user ID to calculate total spending time per user
                    totalDuration: {
                        $sum: {
                            $add: [
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, 3600] }, // Convert hours to seconds
                                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 1] } }, 60] }, // Convert minutes to seconds
                                { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 2] } } // Extract seconds
                            ]
                        }
                    },
                    maxDuration: { $max: '$totalDuration' }
                }
            },
            {
                $lookup: {
                    from: 'users', // Assuming the users collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0, // Exclude the default MongoDB _id field from the output
                    user: {
                        telegramid: '$user.telegramid',
                        first_name: '$user.first_name',
                        last_name: '$user.username'
                    },
                    totalDurationInMinutes: { $divide: ['$totalDuration', 60] },
                    maximumspenttime: { $divide: ['$maxDuration', 60] } // Add the maximum spending time in minutes field
                }
            }
        ]);
        const durations: any = await results?.map((scene: any) => scene.totalDurationInMinutes);
        // console.log(durations)
        const maxTotalDuration = Math.max(...durations);
        // console.log("Maximum totalDurationInMinutes value:", maxTotalDuration);
        let maxTime: any
        usertimedata = [{ userdata: results, maxTime: maxTotalDuration }];

        const resultsclick: any = await clickKpi.aggregate([
            { $unwind: '$clicks' },
            // {
            //     $match: {
            //         'clicks.date': { $gte: startDate, $lte: endDate }
            //     }
            // },

            {
                $group: {
                    _id: '$user',
                    totalProductClicks: { $sum: '$clicks.count' }
                }
            },
            {
                $lookup: {
                    from: 'users', // Assuming the users collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0, // Exclude the default MongoDB _id field from the output
                    user: {
                        telegramid: '$user.telegramid',
                        first_name: '$user.first_name',
                        last_name: '$user.username'
                    },
                    totalProductClicks: 1

                }
            },

        ]);
        // console.log(results)
        const userclicks: any = await resultsclick?.map((scene: any) => scene.totalProductClicks);
        // console.log(durations)
        const maxclick = Math.max(...userclicks);

        userclickdata = [{ userdata: resultsclick, maxClick: maxclick }];

        const orderStatistics = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ['pending','completed', 'cancelled', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    // maxOrderNumber: { $max: '$orderNumber' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    user: {
                        telegramid: '$user.telegramid',
                        first_name: '$user.first_name',
                        username: '$user.username'
                    },
                    totalOrders: 1,
                    // maxOrderNumber: 1
                }
            }
        ]);
        

        const orderData: any = await orderStatistics?.map((scene: any) => scene.totalOrders);
        // console.log(durations)
        const maxOrder= Math.max(...orderData);

        userorderdata = [{ userdata: orderStatistics, maxOrder: maxOrder }];
let userperfromanceData:any=[]

try {


usertimedata.forEach((userTimeDataItem: any) => {
    // Iterate through each user data item in userdata array
    userTimeDataItem.userdata?.forEach((userDataItem: any) => {
        const user = userDataItem.user;
        const timeSpent = userDataItem.totalDurationInMinutes || 0; // If no data, set to 0
        // Find corresponding click data for the user
        const userClickData = userclickdata[0].userdata.find((item: any) => item.user.telegramid === user.telegramid);
        const totalClicks = userClickData ? userClickData.totalProductClicks : 0; // If no data, set to 0

        // Find corresponding order data for the user
        const userOrderData = userorderdata[0].userdata.find((item: any) => item.user.telegramid === user.telegramid);
        const totalOrders = userOrderData ? userOrderData.totalOrders : 0; // If no data, set to 0

        userperfromanceData.push({ user, timeSpent, totalClicks, totalOrders });
    });
});


    // Your existing code here...
    const weights = {
        timeSpent: 0.4,
        totalClicks: 0.3,
        totalOrders: 0.3,
      };
      

      // Calculate normalized metrics and overall score for each user
      const usersWithScores:any = userperfromanceData.map((user:any) => {
        // Normalize metrics
        const normalizedTimeSpent = user.timeSpent / maxTotalDuration;
        const normalizedTotalClicks = user.totalClicks / maxclick;
        const normalizedTotalOrders = user.totalOrders / maxOrder;
      
        // Calculate overall score
        const overallScore =
          normalizedTimeSpent * weights.timeSpent +
          normalizedTotalClicks * weights.totalClicks +
          normalizedTotalOrders * weights.totalOrders;
      
        return {
          user: user,
          timeSpent: user.timeSpent,
          totalClicks: user.totalClicks,
          totalOrders: user.totalOrders,
          overallScore: overallScore.toFixed(2), // Round to 2 decimal places
        };
      });
      usersWithScores.sort((a: any, b: any) => {
        return b.overallScore - a.overallScore;
    });
      res.json({
        usersWithScores

        // userClick: result2,
        // 
    });
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error!' });
}


     







    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const getUsersLotterandInvitedUserData = async (req: Request, res: Response) => {
    console.log("getUsersLotterandInvitedUserData user kpi ")
    try {
        const usersWithLotteryNumbers = await User.find({
            $and: [
                { $or: [
                    { 'lotteryNumbers.number': { $exists: true } },
                    { 'lotteryNumbers.invitedUsers': { $exists: true } }
                ] },
                { 'lotteryNumbers.invitedUsers': { $gt: 0 } }
            ]
        }).select("telegramid first_name username lotteryNumbers");

        // Send the users with lotteryNumbers information as JSON response
        res.json(usersWithLotteryNumbers);
 
        

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};