import 'package:flutter/material.dart';

import 'auth_repository.dart';
import '../home/home_screen.dart';
import 'change_password_screen.dart';
import 'login_screen.dart';

class AuthLandingScreen extends StatefulWidget {
  const AuthLandingScreen({super.key});

  @override
  State<AuthLandingScreen> createState() => _AuthLandingScreenState();
}

class _AuthLandingScreenState extends State<AuthLandingScreen> {
  late final Future<Map<String, dynamic>?> _session = AuthRepository().restoreSession();

  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>?>(
        future: _session,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) return const Scaffold(body: Center(child: CircularProgressIndicator()));
          if (snapshot.data == null) return const LoginScreen();
          if (snapshot.data?['mustChangePassword'] == true) return const ChangePasswordScreen();
          return const HomeScreen();
        },
      );
}
