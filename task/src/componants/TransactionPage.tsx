import React, { useState, useEffect } from 'react';

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });
      try {
        const response = await fetch(`http://localhost:5000/api/v1/transaction/initialize?${queryParams}`);
        const data = await response.json();
        
        if (response.ok) {
          setTransactions(data.data.transactions);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleFilterSubmit = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: 1, 
    }));
  };

  const handlePagination = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  const isNextDisabled = transactions.length < filters.limit;

  const shortenText = (text, maxLength) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9' }}>
      <h2>Transaction Table</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="title"
          placeholder="Filter by title"
          value={filters.title}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <input
          type="text"
          name="description"
          placeholder="Filter by description"
          value={filters.description}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          style={{ margin: '5px' }}
        />
        <button onClick={handleFilterSubmit} style={{ margin: '5px' }}>
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-inverse">
            <thead className="thead-inverse">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Image</th>
                <th>Date of Sale</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{shortenText(transaction.title, 20)}</td>
                    <td>{shortenText(transaction.description, 50)}</td>
                    <td>${transaction.price}</td>
                    <td>{transaction.category}</td>
                    <td>
                      {transaction.image ? (
                        <img
                          src={transaction.image}
                          alt="Transaction"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <span>No image available</span>
                      )}
                    </td>
                    <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => handlePagination(filters.page - 1)}
          disabled={filters.page <= 1}
          style={{ margin: '5px' }}
        >
          Previous
        </button>
        <button
          onClick={() => handlePagination(filters.page + 1)}
          disabled={isNextDisabled}  // Disabling the Next button when the last transation apear
          style={{ margin: '5px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;
