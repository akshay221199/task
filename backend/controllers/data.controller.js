import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { ApiError } from '../utility/ApiError.js';
import axios from 'axios';
import Transaction from '../models/Product.model.js';

const getData = AsyncHandler(async (req, res) => {
  // Fetch data using axios from the external API
  const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  // store in data variable
  const data = response.data;
  // here we insert all data in transaction model using insertMany
  await Transaction.deleteMany({});

  await Transaction.insertMany(data);
  res.status(200).json(new ApiResponse(200, 'Data fetched successfully', data));
});

const listTransactions = AsyncHandler(async (req, res) => {
  const { startDate, endDate, title, description, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  // Initialize the filters object
  const filters = {};

  // Handle title and description filtering
  if (title) {
    filters.title = { $regex: title, $options: 'i' }; // Case-insensitive match for title
  }
  if (description) {
    filters.description = { $regex: description, $options: 'i' }; // Case-insensitive match for description
  }

  // Handle price range filtering
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
      filters.price = { $lte: parsedMaxPrice }; // Filter for max price only
    }
  }

  // Handle startDate and endDate filtering
  if (startDate && endDate) {
    const start = new Date(startDate); // Parse start date
    const end = new Date(endDate); // Parse end date

    // Ensure valid date objects
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      // Set the end date to the end of the day (23:59:59) for proper filtering
      end.setHours(23, 59, 59, 999);

      // Add the date range filter
      filters.dateOfSale = { $gte: start, $lte: end };
    }
  }

  const skip = (page - 1) * limit;  // Calculate the number of documents to skip based on the page number


  const response = await Transaction.find(filters)
    .skip(skip)
    .limit(parseInt(limit));

  if (response.length === 0) {
    throw new ApiError(404, 'No transactions found');
  }

  // Return successful response
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