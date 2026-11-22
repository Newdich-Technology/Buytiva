import 'package:flutter/material.dart';

import '../../core/auth/secure_session_store.dart';
import 'auth_repository.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  final _store = const SecureSessionStore();
  final _repository = AuthRepository();
  final _password = TextEditingController();
  final _code = TextEditingController();
  Map<String, dynamic>? _mfa;
  List<dynamic> _sessions = [];
  String? _error;
  bool _busy = true;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() { _password.dispose(); _code.dispose(); super.dispose(); }

  Future<String?> _token() async => (await _store.read())?['accessToken'] as String?;

  Future<void> _load() async {
    setState(() { _busy = true; _error = null; });
    try {
      final token = await _token();
      if (token == null) throw StateError('Sign in again to review security settings.');
      final results = await Future.wait([_repository.getMfaStatus(token), _repository.listSessions(token)]);
      if (mounted) setState(() { _mfa = results[0] as Map<String, dynamic>; _sessions = results[1] as List<dynamic>; });
    } catch (error) { if (mounted) setState(() => _error = error.toString()); }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _revoke(String id) async {
    final token = await _token();
    if (token == null) return;
    await _perform(() => _repository.revokeSession(token, id));
  }

  Future<void> _disableMfa() async {
    final token = await _token();
    if (token == null) return;
    await _perform(() => _repository.disableTotp(token, _password.text, _code.text), refresh: false);
    if (_error == null && mounted) await Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  Future<void> _logoutAll() async {
    final token = await _token();
    if (token == null) return;
    await _perform(() => _repository.logoutAll(token), refresh: false);
    if (_error == null && mounted) {
      await _store.clear();
      await Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
    }
  }

  Future<void> _perform(Future<void> Function() action, {bool refresh = true}) async {
    setState(() { _busy = true; _error = null; });
    try { await action(); if (refresh) await _load(); } catch (error) { if (mounted) setState(() => _error = error.toString()); }
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Security settings')),
    body: _busy && _mfa == null ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(20), children: [
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ListTile(title: const Text('Multi-factor authentication'), subtitle: Text(_mfa?['enabled'] == true ? 'Authenticator enabled' : 'Authenticator not enabled')),
        if (_mfa?['enabled'] == true) ...[
          TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
          TextField(controller: _code, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Authenticator code')),
          FilledButton(onPressed: _busy ? null : _disableMfa, child: const Text('Disable authenticator')),
        ],
        const SizedBox(height: 18), const Text('Active sessions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        if (_sessions.isEmpty) const ListTile(title: Text('No active sessions returned.')),
        for (final value in _sessions)
          ListTile(title: Text(value['deviceLabel'] as String? ?? 'Unnamed device'), subtitle: Text('Expires ${value['expiresAt']}'), trailing: IconButton(tooltip: 'Revoke session', onPressed: _busy ? null : () => _revoke(value['id'] as String), icon: const Icon(Icons.close))),
        OutlinedButton(onPressed: _busy ? null : _load, child: const Text('Refresh sessions')),
        const SizedBox(height: 12), FilledButton.tonal(onPressed: _busy ? null : _logoutAll, child: const Text('Sign out on all devices')),
      ],
    ),
  );
}
