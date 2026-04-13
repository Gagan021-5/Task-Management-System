class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  static success(message, data = null) {
    return new ApiResponse(200, message, data);
  }

  static created(message, data = null) {
    return new ApiResponse(201, message, data);
  }
}

export default ApiResponse;
