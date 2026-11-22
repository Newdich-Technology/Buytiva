import 'package:flutter/material.dart';

import 'app_router.dart';
import 'app_theme.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../core/design_system/theme_mode_controller.dart';

class BuytivaApp extends StatelessWidget {
  const BuytivaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: BuytivaThemeModeController.mode,
      builder: (context, themeMode, _) => MaterialApp(
      title: 'Buytiva',
      theme: buildBuytivaTheme(),
      darkTheme: buildBuytivaDarkTheme(),
      themeMode: themeMode,
      routes: BuytivaAppRouter.routes,
      initialRoute: '/welcome',
      onGenerateRoute: (settings) {
        if (settings.name == '/welcome') {
          return MaterialPageRoute<void>(
            settings: settings,
            builder: (_) => const OnboardingScreen(),
          );
        }
        return null;
      },
      ),
    );
  }
}
