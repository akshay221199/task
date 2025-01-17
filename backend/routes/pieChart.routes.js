import {Router} from 'express';
import pieChartData from '../controllers/pieChartcontroller.js'

const router = Router();



router.get('/piechart', pieChartData);


export default router;