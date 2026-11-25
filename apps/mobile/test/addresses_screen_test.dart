import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:buytiva_mobile/features/addresses/address_repository.dart';
import 'package:buytiva_mobile/features/addresses/addresses_screen.dart';
import 'package:buytiva_mobile/core/network/api_error.dart';

class FakeAddresses extends AddressRepository {
  final rows = <Map<String, dynamic>>[];
  String? preferredId;
  bool denied = false;
  String? lastToken;
  @override
  Future<List<Map<String, dynamic>>> list(String token, {int offset = 0, int limit = 20}) async {
    lastToken = token;
    if (denied) throw const ApiError('Permission denied', statusCode: 403);
    return List.of(rows);
  }
  @override
  Future<Map<String, dynamic>?> preferred(String token) async =>
      rows.where((row) => row['id'] == preferredId).firstOrNull;
  @override
  Future<Map<String, dynamic>> create(String token, AddressInput input) async {
    final row = {'id': 'address-1', ...input.toJson()};
    rows.add(row);
    return row;
  }
  @override
  Future<Map<String, dynamic>> selectPreferred(String token, String id) async {
    preferredId = id;
    return rows.firstWhere((row) => row['id'] == id);
  }
  @override
  Future<void> delete(String token, String id) async { rows.removeWhere((row) => row['id'] == id); }
}

void main() {
  testWidgets('empty, add, prefer and delete use the authenticated repository', (tester) async {
    final repo = FakeAddresses();
    await tester.pumpWidget(MaterialApp(home: AddressesScreen(repository: repo, tokenLoader: () async => 'test-token')));
    await tester.pumpAndSettle();
    expect(find.text('No saved addresses on this page.'), findsOneWidget);
    expect(repo.lastToken, 'test-token');
    await tester.tap(find.text('Add address'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Save address'));
    await tester.tap(find.text('Save address'));
    await tester.pumpAndSettle();
    expect(find.text('Required'), findsWidgets);
    for (final entry in {'Label': 'Home', 'Address line 1': '1 Main Street', 'Region': 'FCT', 'City': 'Abuja', 'Area': 'Wuse'}.entries) {
      await tester.ensureVisible(find.widgetWithText(TextFormField, entry.key));
      await tester.enterText(find.widgetWithText(TextFormField, entry.key), entry.value);
    }
    await tester.ensureVisible(find.text('Save address'));
    await tester.tap(find.text('Save address'));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
    await tester.tap(find.text('Set preferred'));
    await tester.pumpAndSettle();
    expect(find.text('Home (Preferred)'), findsOneWidget);
    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Delete').last);
    await tester.pumpAndSettle();
    expect(find.text('No saved addresses on this page.'), findsOneWidget);
  });

  testWidgets('permission failure is visible and does not display fake addresses', (tester) async {
    final repo = FakeAddresses()..denied = true;
    await tester.pumpWidget(MaterialApp(home: AddressesScreen(repository: repo, tokenLoader: () async => 'test-token')));
    await tester.pumpAndSettle();
    expect(find.text('Permission denied'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
    expect(find.text('No saved addresses on this page.'), findsNothing);
  });
}
