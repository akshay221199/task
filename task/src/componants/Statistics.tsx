import React, { useState } from 'react';
import axios from 'axios';

const StatisticsPage = () => {
  const [month, setMonth] = useState('');
  const [sold, setSold] = useState('both'); 
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setError(null); 
      const response = await axios.get('http://localhost:5000/api/v1/statistics/statistics', {
        params: { month, sold },
      });
      setStatistics(response.data.data.statistics);
      console.log('statistics', response.data.data.statistics);

      setTransactions(response.data.data.transactions);
      console.log('transactions', response.data.data.transactions);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStatistics(); 
  };

  return (
    <div className='Statistics'>
      <h1>Statistics</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Month:
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Enter month (1-12)"
            min="1"
            max="12"
            width='30%'
            required
          />
        </label>
       
        <label className="form-label">
  Sold:
  <select
    value={sold}
    onChange={(e) => setSold(e.target.value)}
    className="form-select"
    style={{ width: '80%' }} 
  >
    <option value="both">Both</option>
    <option value="true">Sold</option>
    <option value="false">Unsold</option>
  </select>
</label>

        <button type="submit">Filter</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {statistics && (
        <div>
          <h2>Statistics for the Month</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total Sale Amount</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Sold Items Count</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Unsold Items Count</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total Items Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>${statistics.totalSaleAmount}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{statistics.soldItemsCount}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{statistics.unsoldItemsCount}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{statistics.totalItemsCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <h3>Transactions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Product Title</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Product</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{transaction.title}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <img src={transaction.image} alt="product image" width="40px" />
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>${transaction.price}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {transaction.sold ? 'Sold' : 'Unsold'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticsPage;
