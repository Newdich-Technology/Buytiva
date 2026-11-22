import 'package:flutter/material.dart';

import 'app_router.dart';
import 'app_theme.dart';

class BuytivaApp extends StatelessWidget {
  const BuytivaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BUYTIVA Procurement',
      theme: buildBuytivaTheme(),
      routes: BuytivaAppRouter.routes,
      initialRoute: BuytivaAppRouter.homeRoute,
    );
  }
}
