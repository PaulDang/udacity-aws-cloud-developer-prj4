import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { JwtPayloadModel } from "../../models/jwt-payload.model";
import { decode, verify } from "jsonwebtoken";
import { Axios } from "axios";
import { JwtModel } from "../../models/jwt.model";

const jwksUrl = `https://${process.env.OATH}/.well-known/jwks.json`;
const logger = createLogger('OAuth Service');

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken);

    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        logger.info('User was authorized', jwtToken)

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
    const token = getToken(authHeader)
    const jwt: JwtModel = decode(token, { complete: true }) as JwtModel

    const _res = await new Axios().get(jwksUrl);
    const keys = _res.data.keys;
    const signKeys = keys.find(key => key.kid === jwt.header.kid);

    if (!signKeys)
        throw new Error("Incorrect Keys");
    const pemDT = signKeys.x5c[0];
    const secret = `-----BEGIN CERTIFICATE-----\n${pemDT}\n-----END CERTIFICATE-----\n`;;

    const verifyToken = verify(token, secret, { algorithms: ['RS256'] }) as JwtPayloadModel;

    logger.info('Verify token', verifyToken);

    return verifyToken;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
