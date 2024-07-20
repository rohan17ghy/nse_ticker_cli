//This is duplicate code taken from backtest_automation repo
//This can be avoided by using monorepo

import axios, { AxiosResponse } from 'axios';
import { formatDateToISO } from '../utils';
// import { OptionType } from '@/technicals/options';
// import { dateMonthYearString } from '@/datetime/datetime';
// import {OptionsChain} from '@/types';

export const HTTPStatus = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};


async function getBNCurrentWeeklyExpiry(){
    try{
        const result  = await axios.get(`https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY`,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if(result.status != HTTPStatus.OK){
            throw new Error(`Error fetching BankNifty expiries Status: ${result.status}`);
        }

        console.log(`Current BN expiry ${result.data?.records?.expiryDates[0]}`);

        return formatDateToISO(result.data?.records?.expiryDates[0]);
    }
    catch(err){
        console.log(`${err}`);
    }
}


export async function getBNStrikes(){
    try{
        const result = await axios.get(`https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY`,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if(result.status != HTTPStatus.OK){
            throw new Error(`Error fetching BankNifty strikes Status: ${result.status}`);
        }

        const currentExpiry = result.data?.records?.expiryDates[0];
        const spotPrice = result.data?.records?.data[0].CE.underlyingValue;
        
        //const peStrikes = result.data?.records?.data?.filter((st: any) => st.expiryDate == currentExpiry && st.strikePrice > 0);
        console.log(`Current Expiry: ${currentExpiry}, Spot Price: ${spotPrice}`);

    }catch(err){
        console.log(`Error fetching BN strikes ${err}`);
    }
} 

