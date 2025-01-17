
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import Transaction from '../models/Product.model.js';


const statisticsData = AsyncHandler(async (req, res) => {
    const { startOfMonth, endOfMonth, sold } = req.query;
    const statistics = {};
  
    if (!startOfMonth || !endOfMonth) {
      throw new ApiError(400, 'Please provide startOfMonth and endOfMonth');
    }
    console.log('data from statstics', req.query);
    
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
    console.log(transactions);
    
    const statisticss = transactions[0];
  
    const allTransactions = await Transaction.find(matchFilter)
    .select('title description price sold dateOfSale'); // Select the fields you need (or omit .select() for all fields)
  
  
    res.status(200).json({
      statusCode: 200,
      message: 'Statistics fetched successfully',
      data: {
        totalSaleAmount: statisticss.totalSaleAmount,
        soldItemsCount: statisticss.soldItemsCount,
        notSoldItemsCount: statisticss.notSoldItemsCount,
        allTransactions
      },
    });
  });


  export {statisticsData};