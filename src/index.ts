import express from 'express';
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
        app.use('/login', loginRoutes);
        app.use('/marketdata', async (req, res) => {
            getMarketData();
            //await getFirstCandleInfo();
            return res.json('message: Created web socket for fetching market data');
        })
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

