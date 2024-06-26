import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import levelup from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';
import { protect } from './auth/auth';
import { createNewUser, signin, getUserData, updateUserData } from './handlers/user';
import * as dotenv from 'dotenv';

`
THIS IS NOT THE MAIN TS FILE. PLS IGNORE THIS.
(it's moresecureserver.ts)
`

// Load up the .env file FIRST, before anything else
dotenv.config();
const db = levelup(encode(leveldown('./db'), { valueEncoding: 'json' }));

const app = express();

// Rate limiter (ai generated? i dont remember)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter);

// TODO: way to only use cors with origin_site when not in local dev?
// app.use(cors({
//     origin: process.env.ORIGIN_SITE
// }));
app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const port = 8080;

app.get('/', (req, res) => {
	res.send("Success!")
	res.status(200)
})

app.post('/newuser', createNewUser)
app.post('/signin', signin)

// anywhere within /api is protected
app.use('/api', protect)

// these routes called after /api
app.post('/api/getdata', getUserData)
app.post('/api/updatedata', updateUserData)

app.listen(port, () => {
    console.log('Express server initialized on ' + String(port));
});

export default db