import {Router} from 'express';
import  {combineData}  from '../controllers/combineController.js';
const router = Router();



router.get('/combinedata', combineData);


export default router;