import 'package:buytiva_mobile/core/network/api_error.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('extracts nested API error messages safely', () {
    expect(apiErrorMessage({'error': {'code': 'UNAUTHORIZED', 'message': 'Authentication is required.'}}), 'Authentication is required.');
    expect(apiErrorMessage({'message': 'Unavailable'}), 'Unavailable');
    expect(apiErrorMessage({'error': {'message': 3}}), isNull);
    expect(apiErrorMessage(null), isNull);
  });
}
