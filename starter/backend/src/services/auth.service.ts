import { APIGatewayProxyEvent } from "aws-lambda"
import { decode } from "jsonwebtoken"
import { JwtPayloadModel } from "../models/jwt-payload.model"

export function getUserId(event: APIGatewayProxyEvent): string {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const decodedJwt = decode(jwtToken) as JwtPayloadModel;

    return decodedJwt.sub;
}