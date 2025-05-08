import express from 'express';
import routeName from "../config/userRoutes.config.js"
import * as userController from "../controller/user.controller.js";
import { payloadValidate } from '../middleware/validatorMiddleware.js';
import { createUserValidation } from '../validation/user.validation.js';
const routes = express.Router();

// define the routes for user-related API endpoints
routes.route(routeName.create).post(payloadValidate(createUserValidation),userController.createUserController);

export default routes;
