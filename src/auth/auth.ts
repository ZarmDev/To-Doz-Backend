import jwt, { JwtPayload } from 'jsonwebtoken';
/* Copilot said to import Secret
and then use that as a type for the secret */
import { Secret } from 'jsonwebtoken';
import { IncomingHttpHeaders } from 'http';
import { Request, Response, NextFunction } from 'express';
import bycrypt from 'bcrypt';

export const comparePasswords = (password : any, hash : any) => {
    return bycrypt.compare(password, hash);
}

export const hashPassword = (password : any) => {
    // Second argument is a salt, which is a random string that is added to the password
    return bycrypt.hash(password, 5);
}

interface User {
    id: number;
    username: string;
}

// Again I have to do this strange declaration to get typescript to work with custom middleware
declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}

export const createJWT = (user: User, time : string) => {
    const token = jwt.sign({
        id: user.id,
        username: user.username
    },
    process.env.JWT_SECRET as Secret,
    { expiresIn: time }
    )
    return token
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers as IncomingHttpHeaders;
    const bearer = headers.authorization;

    if (!bearer) {
        res.status(401)
        res.json({message: 'not authorized'})
        return
    }
    // [bearer (OMITED), token]
    const [, token] = bearer.split(' ');

    if (!token) {
        res.status(401)
        res.json({message: 'not a valid token'})
        return
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
        next();
    } catch (e) {
        console.error(e);
        res.status(401);
        res.json({message: 'not a valid token'});
        return;
    }
}

export const protectWithOneKey = (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers as IncomingHttpHeaders;
    const bearer = headers.authorization;
    if (!bearer) {
        res.status(401)
        res.json({message: 'not authorized'})
        return
    }
    // [bearer (OMITED), token]
    const [, token] = bearer.split(' ');

    if (!token) {
        res.status(401)
        res.json({message: 'not a valid token'})
        return
    }

    if (token == process.env.SUPER_SECRET_TOKEN) {
        next();
    }
}