import 'package:flutter_test/flutter_test.dart';
import 'package:buytiva_mobile/app/app.dart';

void main() {
  testWidgets('shows the BUYTIVA procurement home screen', (tester) async {
    await tester.pumpWidget(const BuytivaApp());

    expect(find.text('BUYTIVA Procurement'), findsOneWidget);
  });
}
