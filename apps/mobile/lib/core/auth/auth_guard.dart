import 'package:flutter/material.dart';

class AuthGuard extends StatelessWidget {
  const AuthGuard({required this.roles, required this.allowedRoles, required this.child, super.key});

  final List<String> roles;
  final List<String> allowedRoles;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (roles.any(allowedRoles.contains)) return child;
    return const Scaffold(body: Center(child: Text('You do not have access to this area.')));
  }
}
