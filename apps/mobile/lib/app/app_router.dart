import 'package:flutter/widgets.dart';

import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/procurer_application_screen.dart';
import '../features/auth/invitation_screen.dart';
import '../features/auth/password_recovery_screen.dart';
import '../features/auth/change_password_screen.dart';
import '../features/home/home_screen.dart';
import '../features/auth/auth_landing_screen.dart';
import '../features/auth/security_settings_screen.dart';
import '../features/admin/admin_administrators_screen.dart';

class BuytivaAppRouter {
  static const String homeRoute = '/';

  static final Map<String, WidgetBuilder> routes = {
    homeRoute: (_) => const AuthLandingScreen(),
    '/login': (_) => const LoginScreen(),
    '/home': (_) => const HomeScreen(),
    '/register': (_) => const RegisterScreen(),
    '/procurer-application': (_) => const ProcurerApplicationScreen(),
    '/invitation': (_) => const InvitationScreen(),
    '/password-recovery': (_) => const PasswordRecoveryScreen(),
    '/change-password': (_) => const ChangePasswordScreen(),
    '/admin/staff': (_) => const AdminAdministratorsScreen(),
    '/security': (_) => const SecuritySettingsScreen(),
  };
}
