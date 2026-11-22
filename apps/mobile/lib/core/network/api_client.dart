import 'dart:convert';
import 'dart:io';

import '../../app/app_config.dart';
import '../../constants/auth_constants.dart';
import 'api_error.dart';

class ApiClient {
  ApiClient({HttpClient? httpClient}) : _httpClient = httpClient ?? HttpClient();

  final HttpClient _httpClient;

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {String? token}) async {
    return await _send(path, 'POST', body, token) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> get(String path, {String? token}) async {
    return await _send(path, 'GET', null, token) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getList(String path, {String? token}) async {
    return await _send(path, 'GET', null, token) as List<dynamic>;
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body, {String? token}) async {
    return await _send(path, 'PATCH', body, token) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> delete(String path, {String? token}) async =>
      await _send(path, 'DELETE', null, token) as Map<String, dynamic>;

  Future<dynamic> _send(String path, String method, Map<String, dynamic>? body, String? token) async {
    if (apiBaseUrl.isEmpty) throw const ApiError(authClientErrorMessages['apiBaseRequired']!);
    final uri = Uri.parse('$apiBaseUrl$apiVersionPrefix$path');
    final request = await _httpClient.openUrl(method, uri);
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    if (body != null) {
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode(body));
    }
    if (token != null) request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    final response = await request.close();
    final text = await response.transform(utf8.decoder).join();
    final dynamic decoded = text.isEmpty ? <String, dynamic>{} : jsonDecode(text);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = decoded is Map<String, dynamic> ? decoded['message'] as String? : null;
      throw ApiError(message ?? authClientErrorMessages['requestFailed']!, statusCode: response.statusCode);
    }
    return decoded;
  }
}
