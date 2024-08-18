import { JwtHeader } from "jsonwebtoken";
import { JwtPayloadModel } from "./jwt-payload.model";

export class JwtModel {
    header: JwtHeader;
    payload: JwtPayloadModel;
}