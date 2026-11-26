import 'package:buytiva_mobile/core/network/api_client.dart';
import 'package:buytiva_mobile/features/addresses/address_repository.dart';
import 'package:flutter_test/flutter_test.dart';

class RecordingApi extends ApiClient {
  String? method, path, token;
  Map<String, dynamic>? body;
  @override
  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {String? token}) async {
    method = 'POST'; this.path = path; this.body = body; this.token = token;
    return {'id': 'address'};
  }
  @override
  Future<Map<String, dynamic>> put(String path, Map<String, dynamic>? body, {String? token}) async {
    method = 'PUT'; this.path = path; this.body = body; this.token = token;
    return {'id': 'address'};
  }
  @override
  Future<Map<String, dynamic>?> getNullable(String path, {String? token}) async {
    method = 'GET'; this.path = path; this.token = token; return null;
  }
  @override
  Future<List<dynamic>> getList(String path, {String? token}) async {
    method = 'GET'; this.path = path; this.token = token; return [{'id': 'address'}];
  }
  @override
  Future<Map<String, dynamic>> delete(String path, {String? token}) async {
    method = 'DELETE'; this.path = path; this.token = token; return {'deleted': true};
  }
}

void main() {
  test('matches address and preference API contracts with bearer token', () async {
    final api = RecordingApi(); final repo = AddressRepository(api: api);
    const input = AddressInput(label: 'Home', line1: '1 Main St', country: 'NG', region: 'FCT', city: 'Abuja', area: 'Wuse');
    await repo.create('token', input);
    expect(api.path, '/addresses'); expect(api.token, 'token');
    expect(api.body, {'label': 'Home', 'line1': '1 Main St', 'line2': null, 'country': 'NG', 'region': 'FCT', 'city': 'Abuja', 'area': 'Wuse'});
    await repo.update('token', 'a/b', input);
    expect(api.path, '/addresses/a%2Fb'); expect(api.method, 'PUT');
    await repo.selectPreferred('token', 'address');
    expect(api.path, '/addresses/address/preferred'); expect(api.body, isNull);
    expect(await repo.preferred('token'), isNull);
    expect(api.path, '/addresses/preferred');
    expect((await repo.list('token', offset: 2, limit: 5)).single['id'], 'address');
    expect(api.path, '/addresses?offset=2&limit=5');
    await repo.delete('token', 'address'); expect(api.method, 'DELETE');
  });
}
