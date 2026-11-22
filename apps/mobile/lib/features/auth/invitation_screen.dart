import 'package:flutter/material.dart';

import 'auth_provider.dart';

class InvitationScreen extends StatefulWidget {
  const InvitationScreen({super.key});

  @override
  State<InvitationScreen> createState() => _InvitationScreenState();
}

class _InvitationScreenState extends State<InvitationScreen> {
  final _provider = AuthProvider();
  final _token = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _reviewed = false;

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() { _provider.removeListener(_refresh); _provider.dispose(); _token.dispose(); _password.dispose(); _confirmPassword.dispose(); super.dispose(); }

  Future<void> _preview() async { await _provider.previewInvitation(_token.text.trim()); if (_provider.errorMessage == null) setState(() => _reviewed = true); }
  Future<void> _accept() async { await _provider.acceptInvitation(_token.text.trim(), _password.text, _confirmPassword.text); if (_provider.errorMessage == null && mounted) Navigator.pushReplacementNamed(context, '/login'); }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Accept invitation')), body: ListView(padding: const EdgeInsets.all(20), children: [
    if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    if (!_reviewed) ...[
      TextField(controller: _token, decoration: const InputDecoration(labelText: 'Invitation token')),
      FilledButton(onPressed: _provider.isBusy ? null : _preview, child: const Text('Review invitation')),
    ] else ...[
      Text('Invitation is for ${_provider.invitationPreview?['displayName']} (${_provider.invitationPreview?['email']}) as ${_provider.invitationPreview?['role'] ?? _provider.invitationPreview?['kind']}'),
      TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Create password')),
      TextField(controller: _confirmPassword, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm password')),
      FilledButton(onPressed: _provider.isBusy ? null : _accept, child: const Text('Accept invitation')),
    ],
  ]));
}
