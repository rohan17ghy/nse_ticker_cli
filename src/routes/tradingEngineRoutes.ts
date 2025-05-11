import express, {Request, Response} from 'express';
import { AggrCandleManager, AggrMessageType } from '../sockets/aggrCandleManager';
import { TradingEngineSocket } from '../tradingEngine/tradingEngineSocket';

export const tradingEngineRouter = express.Router();

tradingEngineRouter.get('/start', async (req: Request, res: Response) => {
    const dataManager = AggrCandleManager.getInstance();
    res.json({message: 'Started trading engine.'});
});

tradingEngineRouter.post('/subscribe', async (req: Request, res: Response) => {
    const data: AggrMessageType = req.body
        
    const tradingSocket = TradingEngineSocket.getInstance();
    tradingSocket.subscribeToSymbol(data);

    res.json({message: `Subscribed to symbol: ${data.symbol}`});
});