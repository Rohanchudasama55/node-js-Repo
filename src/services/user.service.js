import * as DatabaseHelper from  "../common/baseRepository.js";


// createUserService function to create a new user in the database
export const createUserService = async(userData) => {
    try {
        return await DatabaseHelper.createRecord("user.model",userData)
    } catch (error) {
        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error creating user",
        };
    }
}