import express, {Request, Response} from 'express';
import { getSingleCandle, getTodaysFirstCandleInfo } from '../technicals/history';

export const candlestickRouter = express.Router();

candlestickRouter.get('/singleCandle', async (req: Request, res: Response) => {
    const symbol = req.body.symbol;
    const interval = parseInt(req.body.interval);
    const dateTime = new Date(req.body.dateTime);

    console.log(`Symbol: ${symbol}, Interval: ${interval}, Time: ${dateTime}`);

    return res.json(await getSingleCandle(symbol, interval, dateTime));
});

candlestickRouter.use('/todayFirstCandle', async (req, res) => {

    const dateTime = new Date();
    dateTime.setHours(9, 15, 0, 0);
    
    // if(new Date() < dateTime){
    //     return res.json({"error": "Market has not opened yet!!"});
    // }
    
    const result = await getTodaysFirstCandleInfo(req.body.symbols);

    return res.json(result);
});