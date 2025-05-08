import { sendErrorResponse, sendSuccessResponse } from '../common/response.js';
import * as UserService from '../services/user.service.js';
import { constants } from '../common/constant.js';

const userConstant = constants.User;

// Controller for creating a new user
export const createUserController = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const userCretedData = await UserService.createUserService({
      name,
      email,
      age,
    });
    // check if user not created
    if (!userCretedData ) {
      return sendErrorResponse(res, 400, userConstant.USER_NOT_CREATED);
    }
   // return success response
    return sendSuccessResponse(
      res,
      userConstant.USER_CREATED,
      userCretedData,
      201
    );
  } catch (error) {
    return sendErrorResponse(res, 500, error.message);
  }
};
