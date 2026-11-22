import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:buytiva_mobile/features/onboarding/onboarding_screen.dart';

void main() {
  testWidgets('onboarding moves through the shopping journey', (tester) async {
    FlutterSecureStorage.setMockInitialValues({});
    await tester.pumpWidget(const MaterialApp(home: OnboardingScreen()));
    await tester.pumpAndSettle();

    expect(find.text('Anything you need, in one list.'), findsOneWidget);
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Find your shopping partner.'), findsOneWidget);
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Relax. Your shopping is handled.'), findsOneWidget);
    expect(find.text('Get started'), findsOneWidget);
    await tester.tap(find.text('Back'));
    await tester.pumpAndSettle();
    expect(find.text('Find your shopping partner.'), findsOneWidget);
  });
}
