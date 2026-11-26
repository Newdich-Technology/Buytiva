class ApiError implements Exception {
  const ApiError(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// Reads the backend error envelope while tolerating malformed responses.
String? apiErrorMessage(dynamic decoded) {
  if (decoded is! Map) return null;
  final nested = decoded['error'];
  final source = nested is Map ? nested : decoded;
  final message = source['message'];
  return message is String ? message : null;
}
