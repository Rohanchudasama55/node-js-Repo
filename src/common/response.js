// Function to send a successful response with a message and result
export const sendSuccessResponse = (
    res,
    message,
    result = {},
    statusCode = 200
  ) => {
    return res.status(200).json({
      success: true,
      statusCode,
      message,
      result,
    });
  };
  
  // Function to send an error response with a status code and message
  export const sendErrorResponse = (res, statusCode, message) => {
    return res
      .status(statusCode)
      .json({ success: false, statusCode, error: message });
  };
  