import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const combineData = AsyncHandler(async (req, res) => {
  const { month, price } = req.query;

  if (!month || !/^\d{1,2}$/.test(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'Invalid month format. Please provide a valid month between 1 and 12.');
  }

  if (price && !/^\d{1,10}$/.test(price)) {
    throw new ApiError(400, 'Invalid price format');
  }

  const matchFilter = {
    $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] },
  };

  try {
    // Statistics Data
    const statisticsAggregation = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: { $cond: [{ $eq: ['$sold', true] }, '$price', 0] } },
          soldItemsCount: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },
          unsoldItemsCount: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } },
          totalItemsCount: { $sum: 1 },
        },
      },
    ]);

    const statisticsResult = statisticsAggregation.length > 0 ? statisticsAggregation[0] : null;

    // Pie Chart Data
    const pieChartAggregation = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Bar Chart Data
    const priceBoundaries = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity];
    const barChartAggregation = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $switch: {
              branches: priceBoundaries.map((priceBoundary, index) => ({
                case: {
                  $and: [
                    { $gte: ['$price', priceBoundary] },
                    { $lt: ['$price', priceBoundaries[index + 1]] },
                  ],
                },
                then: priceBoundary,
              })),
              default: 'Other',
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      message: 'Combined data fetched successfully',
      data: {
        statistics: statisticsResult,
        pieChart: pieChartAggregation,
        barChart: barChartAggregation,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while fetching the combined data',
      error: error.message,
    });
  }
});

export { combineData };