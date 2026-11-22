import 'package:flutter/material.dart';

import '../../constants/auth_constants.dart';
import 'auth_provider.dart';

class PasswordRecoveryScreen extends StatefulWidget {
  const PasswordRecoveryScreen({super.key});

  @override
  State<PasswordRecoveryScreen> createState() => _PasswordRecoveryScreenState();
}

class _PasswordRecoveryScreenState extends State<PasswordRecoveryScreen> {
  final _provider = AuthProvider();
  final _email = TextEditingController();
  final _token = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  bool _requested = false;

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() { _provider.removeListener(_refresh); _provider.dispose(); _email.dispose(); _token.dispose(); _password.dispose(); _confirmation.dispose(); super.dispose(); }

  Future<void> _request() async { await _provider.requestPasswordReset(_email.text.trim()); if (_provider.errorMessage == null) setState(() => _requested = true); }
  Future<void> _reset() async { await _provider.resetPassword(_token.text.trim(), _password.text, _confirmation.text); if (_provider.errorMessage == null && mounted) Navigator.pushReplacementNamed(context, '/login'); }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Password recovery')), body: ListView(padding: const EdgeInsets.all(20), children: [
    if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    if (!_requested) ...[
      TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Account email')),
      FilledButton(onPressed: _provider.isBusy ? null : _request, child: const Text('Send recovery instructions')),
    ] else ...[
      Text(passwordRecoveryMessages['sent']!),
      TextField(controller: _token, decoration: const InputDecoration(labelText: 'Recovery token')),
      TextField(controller: _password, obscureText: true, decoration: InputDecoration(labelText: 'New password ($registrationPasswordMinimumLength characters minimum)')),
      TextField(controller: _confirmation, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm password')),
      FilledButton(onPressed: _provider.isBusy ? null : _reset, child: const Text('Reset password')),
    ],
  ]));
}
