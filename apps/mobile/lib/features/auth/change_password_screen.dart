import 'package:flutter/material.dart';

import 'auth_provider.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _provider = AuthProvider();
  final _current = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() { _provider.removeListener(_refresh); _provider.dispose(); _current.dispose(); _password.dispose(); _confirmation.dispose(); super.dispose(); }

  Future<void> _change() async { await _provider.changePassword(_current.text, _password.text, _confirmation.text); if (_provider.errorMessage == null && mounted) Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false); }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Change required password')), body: ListView(padding: const EdgeInsets.all(20), children: [
    if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    TextField(controller: _current, obscureText: true, decoration: const InputDecoration(labelText: 'Current password')),
    TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'New password')),
    TextField(controller: _confirmation, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm new password')),
    FilledButton(onPressed: _provider.isBusy ? null : _change, child: const Text('Change password')),
  ]));
}
