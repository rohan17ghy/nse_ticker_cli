import express from 'express';
import 'dotenv-flow/config';
import loginRoutes from './routes/login';
import cors from 'cors';
import { getMarketData } from './sockets/market-data';
import { recieveOrderDetails } from './sockets/orders';
import { authenticateUser } from './fyers'
import { candlestickRouter } from './routes/candlesticks';
import { get1minCandles } from './technicals/history';
import { DataManager } from './sockets/data_manager';

const main = async () => {
    
    try{
        const app = express();
        const port = 19232;

        app.use(cors());
        app.use(express.json())

        app.use('/candle', candlestickRouter);

        app.use('/1mincandles', async (req, res) => {
            const ceStart = req.body.ceStart;
            const ceEnd = req.body.ceEnd;
            const peStart = req.body.peStart;
            const peEnd = req.body.peEnd;
            await get1minCandles({ type: "SUBSCRIBE_AGGR_OPTIONS", start: ceStart, end: ceEnd, optionType: "CE" });
            return res.json('message: Subscribed to the 1min candles');
        });

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

        const dataManager = DataManager.getInstance();

        authenticateUser();

        

    }catch(err){
        console.log("Error: ", err);
    }    
}

main()
.catch((err) => {
    console.log(`Error in main method: ${err}`);
})

