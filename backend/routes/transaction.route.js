import {Router} from 'express';
import {getData, listTransactions} from '../controllers/data.controller.js'

const router = Router();



router.get('/getTransaction', getData);
router.get('/initialize', listTransactions);



export default router;