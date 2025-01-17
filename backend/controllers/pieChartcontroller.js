import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js'; 
import { AsyncHandler } from '../utility/AsyncHandler.js';
const pieChartData = AsyncHandler(async (req,res) => {
  const { month } = req.query;
  
  // Validate the month format
  if (!month || !/^\d{1,2}$/.test(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'Invalid month format. Please provide a valid month between 1 and 12.');
  }

  try {
    const transactionsAggregation = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, parseInt(month)],
          },
        },
      },
      {
        $group: {
          _id: '$category',  // Assuming 'category' is the field representing item categories
          count: { $sum: 1 },
        },
      },
    ]);

    if (!transactionsAggregation || transactionsAggregation.length === 0) {
      throw new ApiError(404, 'No data found for the selected month.');
    }

   

    const response = {
      statusCode: 200,
      message: 'Transactions found for the selected month',
      data: {
        transactionsAggregation,
      },
    };
  
    res.status(200).json(response);
    return response;

  } catch (error) {
    throw new ApiError(500, 'Error while fetching pie chart data', error.message);
  }
});

export default pieChartData;
