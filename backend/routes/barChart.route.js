import {Router} from 'express';
import  barChart  from '../controllers/barChartController.js';

const router = Router();

router.get('/barchart', barChart);


export default router;