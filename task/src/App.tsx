import './App.css'
import BarChartComponent from './componants/BarChart.tsx'
import Statistics from './componants/Statistics.tsx'
import TransactionTable from './componants/TransactionPage.tsx'
import PieChart from './componants/PieChart.tsx'
function App() {

  return (
    <>
    <TransactionTable />
    <Statistics />
    <BarChartComponent />
    <PieChart />
    </>
  )
}

export default App
