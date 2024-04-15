import { Request, Response } from 'express';

import UserKPI from '../model/UserKpi';
import KpiProducts from '../model/KpiProduct';
import KpiCategorys from '../model/KpiCategory';


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
        const results = await UserKPI.aggregate([
            { $unwind: '$scene' }, // Unwind the scene array
            {
                $match: {
                    'scene.enterTime': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
                }
            },
            {
                $facet: {
                    userTime: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$scene.enterTime' },
                                    month: { $month: '$scene.enterTime' },
                                    day: { $dayOfMonth: '$scene.enterTime' }
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
                                _id: 0,
                                date: {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: '$_id.day'
                                    }
                                },
                                totalDurationInMinutes: { $divide: ['$totalDuration', 60] } // Convert total duration to minutes
                            }
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, // Format date as 'YYYY-MM-DD'
                                totalDurationInMinutes: 1
                            }
                        },
                        { $sort: { date: 1 } }
                    ],
                    totalUserTime: [
                        {
                            $group: {
                                _id: null,
                                totalTime: {
                                    $sum: {
                                        $add: [
                                            { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, // Convert hours to seconds
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
                                totalDurationInMinutes: { $divide: ['$totalTime', 60] } // Convert total duration to minutes
                            }
                        }
                    ]
                }
            }
        ]);
        // console.log(JSON.stringify(results[0].totalUserTime[0].totalDurationInMinutes));
        res.json({ userTime: results[0]?.userTime, totalUserTime: results[0]?.totalUserTime[0]?.totalDurationInMinutes })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const dateRangeSpentTime = async (req: Request, res: Response) => {
    console.log("range user kpi ")
    try {
        const { startDate, endDate } = req.body;
        console.log("range user kpi " + startDate)
        const results: any = await UserKPI.aggregate([
            { $unwind: '$scene' }, // Unwind the scene array
            {
                $match: {
                    "scene.enterTime": { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $facet: {
                    userTime: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$scene.enterTime' },
                                    month: { $month: '$scene.enterTime' },
                                    day: { $dayOfMonth: '$scene.enterTime' }
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
                                _id: 0,
                                date: {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: '$_id.day'
                                    }
                                },
                                totalDurationInMinutes: { $divide: ['$totalDuration', 60] } // Convert total duration to minutes
                            }
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, // Format date as 'YYYY-MM-DD'
                                totalDurationInMinutes: 1
                            }
                        },
                        { $sort: { date: 1 } }
                    ],
                    totalUserTime: [
                        {
                            $group: {
                                _id: null,
                                totalTime: {
                                    $sum: {
                                        $add: [
                                            { $toInt: { $arrayElemAt: [{ $split: ['$scene.duration', ':'] }, 0] } }, // Convert hours to seconds
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
                                totalDurationInMinutes: { $divide: ['$totalTime', 60] } // Convert total duration to minutes
                            }
                        }
                    ]
                }
            }
        ]);
        // console.log(JSON.stringify(results[0].totalUserTime[0].totalDurationInMinutes));
        res.json({ userTime: results[0].userTime, totalUserTime: results[0]?.totalUserTime[0]?.totalDurationInMinutes })
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
                    'scene.enterTime': { $gte: startDate, $lte: endDate } // Filter based on the calculated start and end dates
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
        let totalProductClicksResult = [];
        let totalCategoryClicksResult = [];
        
        if (interval === "perWeek" || interval === "perMonth") {
            totalProductClicksResult = await KpiProducts.aggregate([
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
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$clicks.date" } },
                        totalProductClicks: { $sum: '$clicks.count' }
                    }
                }
            ]);
        
            totalCategoryClicksResult = await KpiCategorys.aggregate([
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
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$clicks.date" } },
                        totalCategoryClicks: { $sum: '$clicks.count' }
                    }
                }
            ]);
        } else if (interval === "perYear") {
            totalProductClicksResult = await KpiProducts.aggregate([
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
                }
            ]);
        
            totalCategoryClicksResult = await KpiCategorys.aggregate([
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
                        totalCategoryClicks: { $sum: '$clicks.count' }
                    }
                }
            ]);
        }
        
        // Combine the results for KpiProduct and KpiCategory
        const combinedResults: any = {};
        totalProductClicksResult.forEach(result => {
            combinedResults[result._id] = (combinedResults[result._id] || 0) + result.totalProductClicks;
        });
        totalCategoryClicksResult.forEach(result => {
            combinedResults[result._id] = (combinedResults[result._id] || 0) + result.totalCategoryClicks;
        });
        
        // Calculate the sum of total clicks
        const sum: any = Object.values(combinedResults).reduce((acc: any, val) => acc + val, 0);
        const sortedDates = Object.keys(combinedResults).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

// Create an array of objects containing sorted dates and total clicks
const sortedResults = sortedDates.map(date => ({
    date,
    totalClicks: combinedResults[date]
}));

        // Send the combined JSON response
        res.json({
            totalClicks: sum,
            clicksByDate: sortedResults
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};

