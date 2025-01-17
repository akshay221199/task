import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const barChart = AsyncHandler(async (req, res) => {
    const { month } = req.query;

    // Validate inputs
    if (!month) {
        throw new ApiError(400, 'Please provide a month.');
    }

    if (!/^\d{1,2}$/.test(month) || month < 1 || month > 12) {
        throw new ApiError(400, 'Invalid month format. Please provide a valid month between 1 and 12.');
    }

    const rangeSize = 100;

    const matchFilter = {
        $expr: {
            $eq: [{ $month: '$dateOfSale' }, parseInt(month)],
        }
    };

    const data = await Transaction.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: {
                    $cond: [
                        { $lt: ['$price', 800] },
                        {
                            $concat: [
                                {
                                    $toString: {
                                        $multiply: [
                                            { $floor: { $divide: ['$price', rangeSize] } },
                                            rangeSize,
                                        ]
                                    }
                                },
                                '-',
                                {
                                    $toString: {
                                        $add: [
                                            {
                                                $multiply: [
                                                    { $floor: { $divide: ['$price', rangeSize] } },
                                                    rangeSize,
                                                ]
                                            },
                                            rangeSize - 1,
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            $cond: [
                                { $and: [{ $gte: ['$price', 800] }, { $lte: ['$price', 900] }] },
                                '800-900',
                                '901-above',
                            ]
                        }
                    ]
                },
                count: { $sum: 1 },
            }
        },
        {
            $sort: { _id: 1 } // Ensure results are sorted
        }
    ]);

    res.status(200).json({
        statusCode: 200,
        message: 'Transactions found for the selected month',
        data,
    });
});

export default barChart;
