import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const barChart = AsyncHandler(async (req, res) => {
    const { month } = req.query;

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
        { $match: matchFilter }, // Apply the match filter
        {
          $bucket: {
            groupBy: "$price", // Group by price
            boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity], // Price ranges
            default: "Other", // Default bucket for non-matching prices
            output: {
              count: { $sum: 1 }, // Count transactions in each range
            },
          },
        },
        {
          $project: {
            _id: 1, // Keep the range name as _id
            count: 1, // Keep the count of transactions
          },
        },
        {
          $sort: { _id: 1 }, // Sort by price range
        },
      ]);
      

    res.status(200).json({
        statusCode: 200,
        message: 'Transactions found for the selected month',
        data,
    });
});

export default barChart;
