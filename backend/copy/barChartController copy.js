import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const combinedStatisticsData = AsyncHandler(async (req, res) => {
  const { startOfMonth, endOfMonth, sold } = req.query;
  const statistics = {};

  if (!startOfMonth || !endOfMonth) {
    throw new ApiError(400, 'Please provide startOfMonth and endOfMonth');
  }

  // Parse the start and end month
  const parsedStartMonth = new Date(startOfMonth);
  const parsedEndMonth = new Date(endOfMonth);

  // Validate the parsed dates
  if (isNaN(parsedStartMonth.getTime()) || isNaN(parsedEndMonth.getTime())) {
    throw new ApiError(400, 'Invalid startOfMonth or endOfMonth');
  }

  const matchFilter = {
    dateOfSale: { $gte: parsedStartMonth, $lte: parsedEndMonth },
  };

  if (sold !== undefined) {
    const isSold = sold === 'true';
    matchFilter.sold = isSold;
  }

  // Aggregate transactions data for statistics
  const transactions = await Transaction.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: null,
        totalSaleAmount: { $sum: '$price' },
        soldItemsCount: {
          $sum: {
            $cond: [{ $eq: ['$sold', true] }, 1, 0],
          },
        },
        notSoldItemsCount: {
          $sum: {
            $cond: [{ $eq: ['$sold', false] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (transactions.length === 0) {
    return res.status(200).json({
      statusCode: 200,
      message: 'No transactions found for the selected range',
      data: {
        totalSaleAmount: 0,
        soldItemsCount: 0,
        notSoldItemsCount: 0,
      },
    });
  }

  const statisticsData = transactions[0];

  // Fetch all transactions data
  const allTransactions = await Transaction.find(matchFilter).select('title description price sold dateOfSale');

  // Aggregate data for pie chart
  const categories = await Transaction.aggregate([
    {
      $match: {
        dateOfSale: { $gte: parsedStartMonth, $lte: parsedEndMonth },
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

  // Aggregate data for bar chart
  const priceBoundaries = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity];
  const priceRanges = await Transaction.aggregate([
    {
      $match: {
        dateOfSale: { $gte: parsedStartMonth, $lte: parsedEndMonth },
      },
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: priceBoundaries,
        default: '901-above',
        output: { count: { $sum: 1 } },
      },
    },
    {
      $addFields: {
        range: {
          $switch: {
            branches: priceBoundaries.map((value, index) => ({
              case: { $eq: ['$_id', value] },
              then: `${value}-${priceBoundaries[index + 1] - 1}`,
            })),
            default: '901-above',
          },
        },
      },
    },
    {
      $project: { _id: 0, range: 1, count: 1 },
    },
  ]);

  return res.status(200).json({
    statusCode: 200,
    message: 'Combined statistics fetched successfully',
    data: {
      totalSaleAmount: statisticsData.totalSaleAmount,
      soldItemsCount: statisticsData.soldItemsCount,
      notSoldItemsCount: statisticsData.notSoldItemsCount,
      allTransactions,
      pieChartData: categories,
      barChartData: priceRanges,
    },
  });
});

export { combinedStatisticsData };
