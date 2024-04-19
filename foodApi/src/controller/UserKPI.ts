import { Request, Response } from 'express';

import UserKPI from '../model/UserKpi';
import KpiProducts from '../model/KpiProduct';
import KpiCategorys from '../model/KpiCategory';
import User from '../model/user.model';
import clickKpi from '../model/UserClicks';


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
        let results =[]
        if(interval==="perWeek"||interval==="perMonth"){
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
                $sort : { "_id": 1}
            }

        ]);
    }else if(interval === "perYear"){
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
                $sort : { "_id": 1}
            }

        ]);
    }
        const totalDurationInMinutes = results.reduce((total, result) => total + result.totalDurationInMinutes, 0);
        console.log(JSON.stringify(results))
        if(!results || results.length == 0){
            return res.status(404).json({ userTime: [], totalDurationInMinutes:0});
        }
        res.json({ userTime: results, totalDurationInMinutes });
        // res.json({ userTime: results });
        // console.log(JSON.stringify(results[0].totalUserTime[0].totalDurationInMinutes));
        // res.json({ userTime: results[0]?.userTime, totalUserTime: results[0]?.totalUserTime[0]?.totalDurationInMinutes })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const dateRangeSpentTime = async (req: Request, res: Response) => {
    console.log("range user kpi ")
    try {
        let results:any =[]
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
                $sort : { "_id": 1}
            }
            
    
        ]);
        // console.log(JSON.stringify(results[0].totalUserTime[0].totalDurationInMinutes));
        // res.json({ userTime: results[0].userTime, totalUserTime: results[0]?.totalUserTime[0]?.totalDurationInMinutes })
        const totalDurationInMinutes :any= results.reduce((total:any, result:any) => total + result.totalDurationInMinutes, 0);
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
        let totalProductClicksResult:any = null;
    

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
            // {
            //     $lookup: {
            //         from: 'User', // Collection to join
            //         localField: '_id', // Field from the input documents (UserKPI collection)
            //         foreignField: '_id', // Field from the documents of the "from" collection (User collection)
            //         as: 'userData' // Output array field
            //     }
            // },
            // {
            //     $unwind: {
            //         path: '$scene',
            //         preserveNullAndEmptyArrays: true // Preserve documents with empty or missing scene arrays
            //     }
            // } // Unwind the user data array
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