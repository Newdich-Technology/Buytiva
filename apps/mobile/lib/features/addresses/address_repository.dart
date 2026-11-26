import '../../core/network/api_client.dart';

/// Uses only server-owned addresses. The caller supplies the active access token.
class AddressRepository {
  AddressRepository({ApiClient? api}) : _api = api ?? ApiClient();
  final ApiClient _api;

  Future<List<Map<String, dynamic>>> list(String token, {int offset = 0, int limit = 20}) async {
    final result = await _api.getList('/addresses?offset=$offset&limit=$limit', token: token);
    return result.map((item) => Map<String, dynamic>.from(item as Map)).toList();
  }

  Future<Map<String, dynamic>> get(String token, String id) => _api.get(_path(id), token: token);
  Future<Map<String, dynamic>?> preferred(String token) => _api.getNullable('/addresses/preferred', token: token);
  Future<Map<String, dynamic>> create(String token, AddressInput input) => _api.post('/addresses', input.toJson(), token: token);
  Future<Map<String, dynamic>> update(String token, String id, AddressInput input) => _api.put(_path(id), input.toJson(), token: token);
  Future<Map<String, dynamic>> selectPreferred(String token, String id) => _api.put('${_path(id)}/preferred', null, token: token);
  Future<void> delete(String token, String id) async { await _api.delete(_path(id), token: token); }

  String _path(String id) => '/addresses/${Uri.encodeComponent(id)}';
}

class AddressInput {
  const AddressInput({required this.label, required this.line1, this.line2, required this.country, required this.region, required this.city, required this.area});
  final String label, line1, country, region, city, area;
  final String? line2;

  Map<String, dynamic> toJson() => {
    'label': label, 'line1': line1, 'line2': line2,
    'country': country, 'region': region, 'city': city, 'area': area,
  };
}
