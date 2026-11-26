import 'package:buytiva_mobile/core/network/api_client.dart';
import 'package:buytiva_mobile/features/shopping_lists/shopping_list_repository.dart';
import 'package:flutter_test/flutter_test.dart';

class RecordingShoppingApi extends ApiClient {
  String? method, path, token;
  Map<String, dynamic>? body;
  @override
  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {String? token}) async {
    method = 'POST'; this.path = path; this.token = token; this.body = body; return {'id': 'list'};
  }
  @override
  Future<Map<String, dynamic>> put(String path, Map<String, dynamic>? body, {String? token}) async {
    method = 'PUT'; this.path = path; this.token = token; this.body = body; return {'id': 'list'};
  }
  @override
  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body, {String? token}) async {
    method = 'PATCH'; this.path = path; this.token = token; this.body = body; return {'id': 'list'};
  }
  @override
  Future<Map<String, dynamic>> delete(String path, {String? token}) async {
    method = 'DELETE'; this.path = path; this.token = token; return {'id': 'list'};
  }
  @override
  Future<List<dynamic>> getList(String path, {String? token}) async {
    method = 'GET'; this.path = path; this.token = token; return [{'id': 'list'}];
  }
}
void main() {
  test('uses authenticated server contracts and exact monetary strings', () async {
    final api = RecordingShoppingApi(); final repo = ShoppingListRepository(api: api);
    await repo.create('token', title: 'Groceries');
    expect(api.path, '/shopping-lists'); expect(api.token, 'token');
    expect(api.body, {'title': 'Groceries', 'currency': 'NGN', 'notes': null});
    const item = ShoppingItemInput(name: 'Rice', quantity: '1.125', expectedUnitPriceMinor: '9007199254740993');
    await repo.addItem('token', 'a/b', item);
    expect(api.path, '/shopping-lists/a%2Fb/items');
    expect(api.body?['quantity'], '1.125'); expect(api.body?['expectedUnitPriceMinor'], '9007199254740993');
    await repo.updateItem('token', 'list', 'item', item); expect(api.method, 'PUT');
    expect(api.path, '/shopping-lists/list/items/item');
    await repo.rename('token', 'list', 'Updated'); expect(api.method, 'PATCH');
    await repo.submit('token', 'list'); expect(api.path, '/shopping-lists/list/submit');
    await repo.removeItem('token', 'list', 'item'); expect(api.method, 'DELETE');
    expect((await repo.list('token', offset: 3, limit: 5)).single['id'], 'list');
    expect(api.path, '/shopping-lists?offset=3&limit=5');
  });
}
