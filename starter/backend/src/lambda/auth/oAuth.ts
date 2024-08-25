import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { JwtPayloadModel } from "../../models/jwt-payload.model";
import { decode, verify } from "jsonwebtoken";
import axios from 'axios';
import { JwtModel } from "../../models/jwt.model";
const jwksUrl = `https://${process.env.OATH}/.well-known/jwks.json`;
const logger = createLogger('OAuth Service');

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        logger.info(`About to validate token: ${event.authorizationToken}`, "OAuth Service");

        const jwtToken = await verifyToken(event.authorizationToken);

        logger.info(`User was authorized: ${jwtToken.sub}`, 'OAuthService');

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', { error: e.message })

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader: string): Promise<JwtPayloadModel> {
    logger.info("Verify Token", "verifyToken");

    const token = getToken(authHeader);
    const jwt: JwtModel = decode(token, { complete: true }) as JwtModel;

    logger.info(`JWT:${JSON.stringify(jwt)}`, 'verifyToken');

    logger.info(`jwksUrl:${jwksUrl}`, 'verifyToken');

    const _res = await axios.get(jwksUrl);

    logger.info(`_res:${_res}`, 'verifyToken');

    const keys = _res.data.keys;
    const signKeys = keys.find(key => key.kid === jwt.header.kid);

    logger.info(`signKeys:${JSON.stringify(signKeys)}`, 'verifyToken');

    if (!signKeys)
        throw new Error("Incorrect Keys");
    const pemDT = signKeys.x5c[0];
    const secret = `-----BEGIN CERTIFICATE-----\n${pemDT}\n-----END CERTIFICATE-----\n`;

    const verifiedToken = verify(token, secret, { algorithms: ['RS256'] }) as JwtPayloadModel;

    logger.info(`Verify token successful: ${verifiedToken}`, 'verifyToken');

    return verifiedToken;
}

function getToken(authHeader: string): string {
    if (!authHeader)
        throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    logger.info(`Token: ${token}`, "getToken");

    return token
}
