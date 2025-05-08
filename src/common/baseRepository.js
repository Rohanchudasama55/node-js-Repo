import mongoose from 'mongoose';

// This function creates a new record in the specified model
export const createRecord = async (modelName, data) => {
  try {
    const dynamicImportModel = await import(`../models/${modelName}.js`).then(
      (module) => module.default
    );
    const document = new dynamicImportModel(data);
    return await document.save();
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw {
        statusCode: 400,
        message: `${field} already exists.`,
      };
    }
    // Handle other errors
    throw {
      statusCode: error.statusCode || 500,
      message: error.message || 'Error saving to database',
    };
  }
};

// This function fetches a record by its ID from the specified model
export const getRecordById = async(modelName, id) => {
  try {
    // Dynamically import the model based on modelName
    const dynamicImportModel = await import(`../models/${modelName}.js`).then(
      (module) => module.default
    );

    return await dynamicImportModel.findById(id);
    
  } catch (error) {
    // Handle any errors that occur while fetching the document
    throw {
      statusCode: error.statusCode || 500,
      message: 'Error fetching record',
      details: error.message,
    };
  }
}

// This function fetches a record by its ID and applies a filter to the query
export const getRecordByIdFilter = async(modelName, id, filter = {}, populateFields = '') => {
    try {
      // Dynamically import the model
      const dynamicImportModel = await import(`../models/${modelName}.js`).then(
        (module) => module.default
      );

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw { statusCode: 400, message: 'Invalid ID format' };
      }

      // Build query
      let query = dynamicImportModel.findOne({ _id: id, ...filter });

      // Apply population (supports string, object, or array of objects)
      if (populateFields) {
        if (Array.isArray(populateFields)) {
          for (const field of populateFields) {
            query = query.populate(field);
          }
        } else {
          query = query.populate(populateFields);
        }
      }

      // Execute query
      const document = await query.exec();
      return document;
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || 'Error fetching record by ID',
        details: error.details || error.message,
      };
    }
  }

// This function fetches all records from the specified model with optional filtering and pagination
export const getRecords = async(modelName, filter = {}, options = {}) => {
    try {
      // Dynamically import the model based on modelName
      const dynamicImportModel = await import(`../models/${modelName}.js`).then(
        (module) => module.default
      );

      // Extract pagination and projection options
      const { page = 1, limit = 10, projection = {} } = options;

      // Pagination is only applied if both `page` and `limit` are provided
      let queryOptions = {};

      // If pagination is required, calculate skip and limit
      if (page && limit) {
        const skip = (page - 1) * limit;
        queryOptions = { projection, skip, limit };
      } else {
        // Otherwise, fetch all data without pagination
        queryOptions = { projection };
      }

      // Query to find documents based on the filter and options
      const documents = await dynamicImportModel.find(filter, projection, queryOptions);
      
      // If no documents found, return an empty array and zero total
      if (!documents || documents.length === 0) {
        return { data: [], total: 0 };
      }

      // If pagination is used, calculate the total count of documents matching the filter
      let result = { data: documents };

      if (page && limit) {
        const total = await dynamicImportModel.countDocuments(filter);

        result = {
          data: documents,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }

      return result;

    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || 'Error fetching records',
        details: error.details || error.message,
      };
    }
  }

// This function updates a record by its ID in the specified model
export const  updateRecordById = async(modelName, id, data)=> {
    try {
      // Dynamically import the model based on modelName
      const dynamicImportModel = await import(`../models/${modelName}.js`).then(
        (module) => module.default
      );

      // Find the record by ID and update it with the provided data
      const updatedRecord = await dynamicImportModel.findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
        }
      );
      return updatedRecord;
    } catch (error) {
      // Handle other errors
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating record",
      };
    }
  }

// This function updates a record based on a filter in the specified model
export const updateRecordByKey = async(modelName, filter, data) => {
    try {
      // Dynamically import the model based on modelName
      const dynamicImportModel = await import(`../models/${modelName}.js`).then(
        (module) => module.default
      );

      // Validate that a filter and data are provided
      if (!filter || Object.keys(filter).length === 0) {
        throw { statusCode: 400, message: "Filter criteria is required" };
      }

      if (!data || Object.keys(data).length === 0) {
        throw { statusCode: 400, message: "No valid fields to update" };
      }

      // Find and update the record based on the filter
      const document = await dynamicImportModel.findOneAndUpdate(filter, data, {
        new: true,
        runValidators: true,
      });

      // If no document is found, throw a 404 error
      if (!document) {
        throw { statusCode: 404, message: "Record not found" };
      }
      return document;
    } catch (error) {
      // Handle other errors
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating record",
        details: error,
      };
    }
  }

// This function deletes a record by its ID in the specified model
export const deleteRecordsByKey = async(modelName, filter = {}) => {
    try {
      const dynamicImportModel = await import(`../models/${modelName}.js`).then(
        (module) => module.default
      );
      const result = await dynamicImportModel.deleteMany(filter);
      return {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting records",
        details: error.details || error.message,
      };
    }
  }

// This function deletes multiple records based on a filter in the specified model
export const deleteManyRecords = async(modelName, filter) => {
    try {
      // Dynamically import the model based on modelName
      const dynamicImportModel = await import(`../model/${modelName}.js`).then(
        (module) => module.default
      );
  
      // Ensure the filter is valid
      if (!filter || typeof filter !== "object") {
        throw { statusCode: 400, message: "Invalid filter object" };
      }
  
      // Perform bulk deletion
      const result = await dynamicImportModel.deleteMany(filter);
  
      // Check if any documents were deleted
      if (result.deletedCount === 0) {
        throw { statusCode: 404, message: "No matching records found" };
      }
  
      return {
        message: `${result.deletedCount} record(s) deleted successfully`,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      // Handle errors and provide structured responses
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting records",
        details: error.message,
      };
    }
  }
