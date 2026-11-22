import 'package:flutter/widgets.dart';

import '../features/home/home_screen.dart';

class BuytivaAppRouter {
  static const String homeRoute = '/';

  static final Map<String, WidgetBuilder> routes = {
    homeRoute: (_) => const HomeScreen(),
  };
}
