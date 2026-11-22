import 'package:flutter/material.dart';

import '../../core/auth/secure_session_store.dart';
import '../auth/auth_repository.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _store = const SecureSessionStore();
  Map<String, dynamic>? _session;

  @override
  void initState() { super.initState(); _loadSession(); }

  Future<void> _loadSession() async {
    final session = await _store.read();
    if (mounted) setState(() => _session = session);
  }

  Future<void> _signOut() async {
    final accessToken = _session?['accessToken'] as String?;
    if (accessToken != null) await AuthRepository(store: _store).signOut(accessToken);
    if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final user = _session?['user'] as Map<String, dynamic>? ?? {};
    final roles = (user['roles'] as List<dynamic>? ?? []).cast<String>();
    final currentRole = user['currentRole'] as String? ?? (roles.isEmpty ? 'CUSTOMER' : roles.first);
    return Scaffold(appBar: AppBar(title: const Text('BUYTIVA'), actions: [IconButton(onPressed: _signOut, icon: const Icon(Icons.logout), tooltip: 'Sign out')]), body: ListView(padding: const EdgeInsets.all(24), children: [
      Text('Welcome ${user['displayName'] ?? user['email'] ?? ''}', style: Theme.of(context).textTheme.headlineSmall),
      Text('Active role: $currentRole'),
      if (currentRole == 'PROCURER') const ListTile(title: Text('Procurer workspace'), subtitle: Text('Approved procurer tools are available for this account.')),
      if (currentRole == 'CUSTOMER') const ListTile(title: Text('Customer workspace'), subtitle: Text('Browse and manage your procurement activity.')),
      if (currentRole == 'ADMIN' || currentRole == 'SUPER_ADMIN') const ListTile(title: Text('Administration workspace'), subtitle: Text('Administrative access is enforced by each backend permission.')),
      if (currentRole == 'SUPER_ADMIN') const ListTile(title: Text('Super Administrator'), subtitle: Text('Staff management and audit access are restricted to this role.')),
      if (currentRole == 'SUPER_ADMIN') FilledButton(onPressed: () => Navigator.pushNamed(context, '/admin/staff'), child: const Text('Manage staff')),
    ]));
  }
}
