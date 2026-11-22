import 'dart:convert';

import 'package:flutter/services.dart';

class BuytivaErrorState {
  const BuytivaErrorState({
    required this.id,
    required this.httpStatus,
    required this.presentation,
    required this.title,
    required this.body,
    required this.primaryAction,
    required this.illustration,
    required this.severity,
  });

  final String id;
  final int? httpStatus;
  final String presentation;
  final String title;
  final String body;
  final String primaryAction;
  final String illustration;
  final String severity;
}

class BuytivaErrorCatalog {
  static Map<String, BuytivaErrorState>? _states;

  static Future<void> load() async {
    if (_states != null) return;
    final raw = await rootBundle.loadString('assets/config/BUYTIVA_ERROR_CATALOG.json');
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    final values = decoded['states'] as List<dynamic>;
    _states = {
      for (final item in values)
        (item as Map<String, dynamic>)['id'] as String: BuytivaErrorState(
          id: item['id'] as String,
          httpStatus: item['httpStatus'] as int?,
          presentation: item['presentation'] as String,
          title: item['title'] as String,
          body: item['body'] as String,
          primaryAction: item['primaryAction'] as String,
          illustration: item['illustration'] as String,
          severity: _severity(item['id'] as String),
        ),
    };
  }

  static BuytivaErrorState resolve(String code, int status) {
    final states = _states ?? const <String, BuytivaErrorState>{};
    final coded = states[code.toLowerCase()];
    if (coded != null) return coded;
    return states.values.cast<BuytivaErrorState?>().firstWhere(
          (value) => value?.httpStatus == status,
          orElse: () => states['server_error'],
        ) ?? _fallback;
  }

  static String _severity(String id) => id.contains('payment') || id.contains('payout')
      ? 'warning'
      : id == 'server_error'
          ? 'critical'
          : 'info';

  static const _fallback = BuytivaErrorState(
    id: 'server_error',
    httpStatus: 500,
    presentation: 'route',
    title: 'Well, that wasn’t on the list.',
    body: 'We couldn’t finish that request. Please try again.',
    primaryAction: 'retry_safe',
    illustration: 'tangled_ribbon',
    severity: 'critical',
  );
}
