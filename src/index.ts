import express, { Request, Response } from 'express';
import 'dotenv-flow/config';
import loginRoutes from './routes/login';
import cors from 'cors';
import { getMarketData } from './sockets/ltpSocket';
import { recieveOrderDetails } from './sockets/orders';
import { authenticateUser } from './fyers'
import { candlestickRouter } from './routes/candlesticks';
import { get1minAggrCandles, get1minCandles } from './technicals/history';
import { AggrCandleManager } from './sockets/aggrCandleManager';
import { TradingEngineSocket } from './tradingEngine/tradingEngineSocket';
import { tradingEngineRouter } from './routes/tradingEngine';

const main = async () => {
    
    try{
        const app = express();
        const port = 19232;

        app.use(cors());
        app.use(express.json())

        app.use('/candle', candlestickRouter);

        app.post('/1minaggrcandles', async (req, res) => {
            const symbol = req.body.symbol;
            const start = req.body.start;
            const end = req.body.end;
            const optionType = req.body.optionType;
            const candles = await get1minAggrCandles({ type: "SUBSCRIBE_AGGR_OPTIONS", symbol, start, end, optionType });
            return res.json(candles);
        });

        app.get('/1mincandles', async (req: Request, res: Response) => {
            const symbol = req.query.symbol as string;
            console.log(`Symbol: ${symbol}`);
            const candles = await get1minCandles(symbol);
            return res.json(candles);
        });

        app.use('/tradeengine', tradingEngineRouter);

        app.use('/marketdata', async (req, res) => {
            const symbol = req.body.symbol;
            const interval = req.body.interval;
            const numberOfPrevCandles = req.body.numberOfPrevCandles;
            getMarketData(symbol, interval, numberOfPrevCandles);
            return res.json('message: Created web socket for fetching market data');
        });

        app.use('/order', (req, res) => {
            recieveOrderDetails()
            return res.json('message: Created web socket for recieving orders data');
        });

        app.use('/login', loginRoutes);

        app.use('/', (req, res) => {
            return res.json({ message: "Welcome to the nse ticker cli" });
        });

        app.listen(port, () => {
            console.log(`The server running at port ${port}`);
        });

        authenticateUser();                

    }catch(err){
        console.log("Error: ", err);
    }    
}

main()
.catch((err) => {
    console.log(`Error in main method: ${err}`);
})

