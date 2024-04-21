import express, {Request, Response} from 'express';
import { fyers } from '../fyers';
import { getAuthCode, setAccessToken, setAuthCode} from '../fyers';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    try{
        console.log(`Login successfull`);
        if(req.query.code == '200'){
            const auth_code: string = req.query.auth_code as string;
            setAuthCode(auth_code);
            console.log(getAuthCode());
            fyers.generate_access_token({ "secret_key": process.env.SECRET_KEY, "auth_code": auth_code })
            .then((response: any) => {
                console.log(JSON.stringify(response));
                setAccessToken(response.access_token);
            }).catch((error: any) => {
                console.log(JSON.stringify(error))
            })

        }else{
            return res.status(401).json('message: Unable to authenticate the user');
        }
    }
    catch(err: any){
        return res.status(401).json(`message: Unable to authenticate the user, err: ${err}`);
    }
    
    return res.redirect(`https://www.google.com`);
});


export default router;