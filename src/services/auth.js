import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { getAuthUser } from '../databases/auth.js';

const ACCESS_TOKEN_EXPIRES = '1h';
const REFRESH_TOKEN_EXPIRES = '7d';

const generateAccessToken = (username) => {
    return jwt.sign(
        { sub: username },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES
        }
    );
};

const generateRefreshToken = (username) => {
    return jwt.sign(
        {
            sub: username,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRES
        }
    );
};

export function doLogin(username, password) {
    const user = getAuthUser(username);

    if (!user || user.password !== password) {
        return null;
    }

    const accessToken = generateAccessToken(username);
    const refreshToken = generateRefreshToken(username);

    return {
        user: username,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600
    };
}

export const refreshAccessToken = (refreshToken) => {
    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (payload.type !== 'refresh') {
            return null;
        }

        const user = getAuthUser(payload.sub);

        if (!user) {
            return null;
        }

        const accessToken = generateAccessToken(payload.sub);

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600
        };

    } catch (err) {
        return null;
    }
};
