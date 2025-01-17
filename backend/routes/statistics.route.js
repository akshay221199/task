import {Router} from 'express';
import  statisticsData from '../controllers/statisticsController.js'

const router = Router();

router.get('/statistics', statisticsData);


export default router;