import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import axios from 'axios';
import Transaction from '../models/Product.model.js';

const getData = AsyncHandler(async (req, res) => {
  const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  const data = response.data;
  await Transaction.deleteMany({});

  await Transaction.insertMany(data);
  res.status(200).json(new ApiResponse(200, 'Data fetched successfully', data));
});

const listTransactions = AsyncHandler(async (req, res) => {
  const { startDate, endDate, title, description, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  const filters = {};

  if (title) {
    filters.title = { $regex: title, $options: 'i' }; 
  }
  if (description) {
    filters.description = { $regex: description, $options: 'i' }; 
  }

  if (minPrice && maxPrice) {
    const parsedMinPrice = parseFloat(minPrice);
    const parsedMaxPrice = parseFloat(maxPrice);

    if (!isNaN(parsedMinPrice) && !isNaN(parsedMaxPrice)) {
      filters.price = { $gte: parsedMinPrice, $lte: parsedMaxPrice }; // Filter within the price range
    }
  } else if (minPrice) {
    const parsedMinPrice = parseFloat(minPrice);
    if (!isNaN(parsedMinPrice)) {
      filters.price = { $gte: parsedMinPrice }; // Filter for min price only
    }
  } else if (maxPrice) {
    const parsedMaxPrice = parseFloat(maxPrice);
    if (!isNaN(parsedMaxPrice)) {
      filters.price = { $lte: parsedMaxPrice }; 
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate); 
    const end = new Date(endDate); 

    // Ensure valid date objects
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);

      filters.dateOfSale = { $gte: start, $lte: end };
    }
  }

  const skip = (page - 1) * limit;  


  const response = await Transaction.find(filters)
    .skip(skip)
    .limit(parseInt(limit));

  if (response.length === 0) {
    throw new ApiError(404, 'No transactions found');
  }

  res.status(200).json(new ApiResponse(200, 'Transactions fetched successfully', {
    transactions: response,
    pagination: {
      currentPage: page,
      totalItems: await Transaction.countDocuments(filters),
      totalPages: Math.ceil(await Transaction.countDocuments(filters) / limit)
    }
  }));

});




export { getData, listTransactions };