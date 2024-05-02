import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv-flow/config';
import loginRoutes from './routes/login';
import cors from 'cors';
import { getMarketData } from './sockets/market-data';
import { getFirstCandleInfo } from './sockets/history';
import { authenticateUser } from './fyers'

const main = async () => {
    
    try{
        const app = express();
        const port = 19232;

        app.use(cors());
        app.use(express.json())

        app.use('/firstCandle', async (req, res) => {

            const dateTime = new Date();
            dateTime.setHours(9, 15, 0, 0);
            
            // if(new Date() < dateTime){
            //     return res.json({"error": "Market has not opened yet!!"});
            // }
            
            const result = await getFirstCandleInfo(req.body.symbols);

            return res.json(result);
        })
        app.use('/marketdata', async (req, res) => {
            const symbol = req.body.symbol;
            const interval = req.body.interval;
            const numberOfPrevCandles = req.body.numberOfPrevCandles;
            getMarketData(symbol, interval, numberOfPrevCandles);
            return res.json('message: Created web socket for fetching market data');
        })
        app.use('/login', loginRoutes);
        app.use('/', (req, res) => {
            return res.json({ message: "Welcome to the nse ticker cli" });
        })

        app.listen(port, () => {
            console.log(`The server running at port ${port}`);
        })

        authenticateUser();

    }catch(err){
        console.log("Error: ", err);
    }    
}

main()
.catch((err) => {
    console.log(`Error in main method: ${err}`);
})

