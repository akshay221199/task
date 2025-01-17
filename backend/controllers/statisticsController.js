import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';

const statisticsData = AsyncHandler(async (req, res) => {
  const { month, sold } = req.query;

  // Validate the month
  if (!month) {
    throw new ApiError(400, 'Please provide a month.');
  }

  if (!/^\d{1,2}$/.test(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'Invalid month format. Please provide a valid month between 1 and 12.');
  }

  // Base filter for month
  const matchFilter = {
    $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] },
  };

  // Handle sold query parameter
  if (sold !== undefined && sold !== 'both') {
    const isSold = sold === 'true'; // Convert 'true'/'false' string to boolean
    matchFilter.sold = isSold;
  }

  // Aggregation pipeline for statistics
  const aggregationPipeline = [
    {
      $match: {
        $expr: { $eq: [{ $month: '$dateOfSale' }, parseInt(month)] },
      },
    },
    {
      $group: {
        _id: null,
        totalSaleAmount: { $sum: { $cond: [{ $eq: ['$sold', true] }, '$price', 0] } },
        soldItemsCount: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },
        unsoldItemsCount: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } },
        totalItemsCount: { $sum: 1 },
      },
    },
  ];

  // Fetch statistics for the selected month
  const transactionsAggregation = await Transaction.aggregate(aggregationPipeline);

  if (!transactionsAggregation || transactionsAggregation.length === 0) {
    return res.status(404).json({
      statusCode: 404,
      message: 'No transactions found for the selected month.',
    });
  }

  // Statistics data
  const statisticsResult = transactionsAggregation[0];

  // Fetch transaction data based on `sold` filter
  const data = await Transaction.find(matchFilter);

  // Final response structure
  const response = {
    statusCode: 200,
    message: `Transactions found for the selected month${
      sold === 'true' ? ' (Sold)' : sold === 'false' ? ' (Unsold)' : ''
    }.`,
    data: {
      statistics: statisticsResult,
      transactions: data,
    },
  };

  res.status(200).json(response);
});

export default statisticsData;
