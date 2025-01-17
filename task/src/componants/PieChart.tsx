import  { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const PieChart = () => {
  const [chartData, setChartData] = useState<{ _id: string; count: number }[] | null>(null);
  const [month, setMonth] = useState('1'); // Default month as January
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data when month changes
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/pieChart/piechart?month=${month}`);
        setChartData(response.data.data.transactionsAggregation);
        setError(null); // Reset any errors
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.message);
        } else {
          setError('An error occurred');
        }
      }
    };

    fetchChartData();
  }, [month]); // Fetch data when the month changes

  // Prepare chart data if available
  const prepareChartData = () => {
    if (!chartData) return { labels: [], datasets: [] };
    const labels = chartData.map(item => item._id);
    const data = chartData.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Transaction Categories',
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF5733'], // Customize colors
          hoverOffset: 4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This allows for custom sizing
    plugins: {
      legend: {
        position: 'top' as const, // Customize legend position
        labels: {
          font: {
            size: 18, // Bigger font size for legend
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: 16, // Tooltip font size
        },
      },
      title: {
        display: true,
        text: 'Transactions by Category',
        font: {
          size: 22, // Bigger font size for title
        },
      },
    },
    scales: {
      y: {
        ticks: {
          font: {
            size: 16, // Font size for y-axis ticks
          },
        },
      },
    },
  };

  return (
    <div className='pieChart'>
      <h2>Transaction Data for the Month</h2>
      <div>
        <label htmlFor="month">Select Month: </label>
        <select
          id="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
        >
          {[...Array(12)].map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {chartData ? (
        <div style={{ position: 'relative', width: '500px', height: '500px' }}> {/* Adjust width and height */}
          <Pie data={prepareChartData()} options={chartOptions} />
        </div>
      ) : (
        <p>Loading pie chart...</p>
      )}
    </div>
  );
};

export default PieChart;
