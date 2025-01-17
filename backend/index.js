import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectToMongo from './config.js';
import transactionRouter from './routes/transaction.route.js'
import statisticsRouter from './routes/statistics.route.js'
import barChartRouter from './routes/barChart.route.js'
import pieChartRouter from './routes/pieChart.routes.js'
import combineRouter from './routes/combine.route.js'
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
dotenv.config();
const port = process.env.PORT;
connectToMongo();

    app.use('/api/v1/transaction', transactionRouter);
    app.use('/api/v1/statistics', statisticsRouter);
    app.use('/api/v1/barChart', barChartRouter);
    app.use('/api/v1/pieChart', pieChartRouter);
    app.use('/api/v1/combineData', combineRouter);





app.listen(port, ()=>{
    console.log(`Your App is Running on Port ${port}`);
})