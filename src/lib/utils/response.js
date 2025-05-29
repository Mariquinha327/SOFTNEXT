export class ApiResponse {
  static success(data, message = 'Sucesso', status = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, status = 400, details = null) {
    return {
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    };
  }
}