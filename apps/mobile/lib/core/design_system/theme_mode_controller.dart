import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BuytivaThemeModeController {
  BuytivaThemeModeController._();

  static const _storage = FlutterSecureStorage();
  static const _storageKey = 'buytiva_theme_mode';
  static final ValueNotifier<ThemeMode> mode = ValueNotifier(ThemeMode.system);

  static Future<void> load() async {
    final value = await _storage.read(key: _storageKey);
    mode.value = switch (value) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  static Future<void> set(ThemeMode value) async {
    mode.value = value;
    await _storage.write(key: _storageKey, value: value.name);
  }
}
