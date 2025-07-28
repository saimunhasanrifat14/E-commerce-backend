class APIResponse {
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode; // HTTP status code 【4356.56, type: source】
    this.message = message; // Response message 【4356.56, type: source】
    this.data = data; // Data payload 【4356.56, type: source】
    this.success = statusCode < 400; // Indicates if the response is successful (status code less than 400) 【4428.56, type: source】
  }

  // Static method for successful responses
  static success(res, statusCode, message, data) {
    return res
      .status(statusCode)
      .json(new APIResponse(statusCode, message, data)); // Sends a JSON response with the APIResponse object 【4758.32, type: source】
  }
}

export default APIResponse; // Export the APIResponse class 【4888.56, type: source】
