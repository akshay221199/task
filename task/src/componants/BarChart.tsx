import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChartComponent = () => {
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/barChart/barchart",
        { params: { month } }
      );

      const rawData = response.data.data;

      // Group data into ranges
      const rangeSize = 100;
      const groupedData = {};

      rawData.forEach((item) => {
        const price = parseInt(item._id, 10); // Ensure price is a number
        const rangeStart = Math.floor(price / rangeSize) * rangeSize;
        const rangeLabel = `${rangeStart}-${rangeStart + rangeSize - 1}`;
        
        if (!groupedData[rangeLabel]) {
          groupedData[rangeLabel] = 0;
        }
        groupedData[rangeLabel] += item.count;
      });

      const labels = Object.keys(groupedData);
      const values = Object.values(groupedData);

      setChartData({
        labels,
        datasets: [
          {
            label: "Transactions Count",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!month) {
      setError("Please provide a month.");
      return;
    }
    fetchChartData();
  };

  return (
    <div className="barChart" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Bar Chart for Transactions</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "10px" }}>Month (1-12):</label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Enter month"
            min="1"
            max="12"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {chartData && (
        <div>
          <h3>Transactions Chart</h3>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
};

export default BarChartComponent;
