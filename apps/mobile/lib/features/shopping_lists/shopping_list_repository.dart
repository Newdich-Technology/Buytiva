import '../../core/network/api_client.dart';

/// All totals and permissions are enforced by the API; money remains minor-unit strings.
class ShoppingListRepository {
  ShoppingListRepository({ApiClient? api}) : _api = api ?? ApiClient();
  final ApiClient _api;

  Future<List<Map<String, dynamic>>> list(String token, {int offset = 0, int limit = 20}) async {
    final result = await _api.getList('/shopping-lists?offset=$offset&limit=$limit', token: token);
    return result.map((item) => Map<String, dynamic>.from(item as Map)).toList();
  }
  Future<Map<String, dynamic>> get(String token, String id) => _api.get(_list(id), token: token);
  Future<Map<String, dynamic>> create(String token, {required String title, String? notes}) =>
      _api.post('/shopping-lists', {'title': title, 'currency': 'NGN', 'notes': notes}, token: token);
  Future<Map<String, dynamic>> rename(String token, String id, String title) =>
      _api.patch(_list(id), {'title': title}, token: token);
  Future<Map<String, dynamic>> addItem(String token, String id, ShoppingItemInput item) =>
      _api.post('${_list(id)}/items', item.toJson(), token: token);
  Future<Map<String, dynamic>> updateItem(String token, String id, String itemId, ShoppingItemInput item) =>
      _api.put('${_list(id)}/items/${Uri.encodeComponent(itemId)}', item.toJson(), token: token);
  Future<Map<String, dynamic>> removeItem(String token, String id, String itemId) =>
      _api.delete('${_list(id)}/items/${Uri.encodeComponent(itemId)}', token: token);
  Future<Map<String, dynamic>> submit(String token, String id) => _api.post('${_list(id)}/submit', {}, token: token);
  Future<void> delete(String token, String id) async { await _api.delete(_list(id), token: token); }
  String _list(String id) => '/shopping-lists/${Uri.encodeComponent(id)}';
}

class ShoppingItemInput {
  const ShoppingItemInput({required this.name, required this.quantity, required this.expectedUnitPriceMinor, this.notes});
  final String name, quantity, expectedUnitPriceMinor;
  final String? notes;
  Map<String, dynamic> toJson() => {'name': name, 'quantity': quantity, 'expectedUnitPriceMinor': expectedUnitPriceMinor, 'notes': notes};
}
