import 'package:flutter/material.dart';

import '../../constants/auth_constants.dart';
import 'auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _provider = AuthProvider();
  final _email = TextEditingController();
  final _name = TextEditingController();
  final _password = TextEditingController();
  final _challenge = TextEditingController();
  final _code = TextEditingController();
  bool _submitted = false;

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() {
    _provider.removeListener(_refresh); _provider.dispose();
    _email.dispose(); _name.dispose(); _password.dispose(); _challenge.dispose(); _code.dispose(); super.dispose();
  }

  Future<void> _register() async { await _provider.register(_email.text.trim(), _name.text.trim(), _password.text); if (_provider.errorMessage == null) setState(() => _submitted = true); }
  Future<void> _verify() async { await _provider.verifyEmail(_email.text.trim(), _challenge.text.trim(), _code.text.trim()); if (_provider.errorMessage == null && mounted) Navigator.pushReplacementNamed(context, '/login'); }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Customer registration')), body: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 480), child: ListView(padding: const EdgeInsets.all(24), shrinkWrap: true, children: [
    if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    if (!_submitted) ...[
      TextField(controller: _name, decoration: const InputDecoration(labelText: 'Full name')),
      TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
      TextField(controller: _password, obscureText: true, decoration: InputDecoration(labelText: 'Password ($registrationPasswordMinimumLength characters minimum)')),
      FilledButton(onPressed: _provider.isBusy ? null : _register, child: const Text('Create account')),
    ] else ...[
      const Text('Enter the challenge reference and code sent to your email.'),
      TextField(controller: _challenge, decoration: const InputDecoration(labelText: 'Challenge reference')),
      TextField(controller: _code, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Email code')),
      FilledButton(onPressed: _provider.isBusy ? null : _verify, child: const Text('Verify email')),
    ],
  ]))));
}
