import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const pieChartData = AsyncHandler(async (req, res) => {
    const { startOfMonth, endOfMonth } = req.query;
    console.log('data from piechart', req.query);
    
  
    // Check if both startDate and endDate are provided
    if (!startOfMonth || !endOfMonth) {
      return res.status(400).json({
        message: 'Both startDate and endDate are required',
      });
    }
  
    // Convert startDate and endDate to Date objects
    const start = new Date(startOfMonth);
    const end = new Date(endOfMonth);
  
    // Validate the dates
    if (isNaN(start.getMonth()) || isNaN(end.getMonth())) {
      return res.status(400).json({
        message: 'Invalid startDate or endDate format',
      });
    }
  
    console.log('Start Date:', start);
    console.log('End Date:', end);
  
    // Aggregate transaction data grouped by category
    const categories = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  
    if (!categories || categories.length === 0) {
      return res.status(200).json({
        message: 'No data found for the selected dates',
        data: [],
      });
    }
  
    res.status(200).json({
      message: 'Pie chart data fetched successfully',
      data: categories,
    });
  });
  

export { pieChartData };
