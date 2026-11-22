import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureSessionStore {
  const SecureSessionStore({FlutterSecureStorage storage = const FlutterSecureStorage()}) : _storage = storage;

  static const sessionKey = 'buytiva_auth_session';
  final FlutterSecureStorage _storage;

  Future<void> save(Map<String, dynamic> session) => _storage.write(key: sessionKey, value: jsonEncode(session));

  Future<Map<String, dynamic>?> read() async {
    final value = await _storage.read(key: sessionKey);
    if (value == null) return null;
    return jsonDecode(value) as Map<String, dynamic>;
  }

  Future<void> clear() => _storage.delete(key: sessionKey);
}
