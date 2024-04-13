import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    console.log(req.params);
    return res.json({message: "Login request recieved"});
});


export default router;