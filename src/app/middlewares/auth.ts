/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import { ApiError } from '../../errors/ApiErrors';
import config from '../../config';
import { jwtHelpers } from '../../helper/jwtHelper';


const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token from request --> headers
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      let verifiedUser = null;

      // Verify Token
      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      console.log(verifiedUser);
      

      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden credentials');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
