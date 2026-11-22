import 'package:flutter/material.dart';

import 'app/app.dart';
import 'core/design_system/error_catalog.dart';
import 'core/design_system/theme_mode_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await BuytivaThemeModeController.load();
  await BuytivaErrorCatalog.load();
  runApp(const BuytivaApp());
}
