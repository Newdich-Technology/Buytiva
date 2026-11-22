import 'package:flutter/material.dart';

import '../../core/auth/secure_session_store.dart';
import '../../core/design_system/lordicon_sources.dart';
import '../../core/design_system/theme_mode_controller.dart';
import '../../core/widgets/buytiva_lordicon.dart';
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
    return Scaffold(appBar: AppBar(title: const Text('Buytiva'), actions: [PopupMenuButton<ThemeMode>(tooltip: 'Choose theme', icon: const BuytivaLordicon(assetPath: lordiconTheme, label: 'Theme', width: 24, height: 24, playOnLoad: true), onSelected: BuytivaThemeModeController.set, itemBuilder: (context) => const [PopupMenuItem(value: ThemeMode.system, child: Text('System theme')), PopupMenuItem(value: ThemeMode.light, child: Text('Light theme')), PopupMenuItem(value: ThemeMode.dark, child: Text('Dark theme'))]), IconButton(onPressed: _signOut, icon: const BuytivaLordicon(assetPath: lordiconPersonExit, label: 'Sign out', width: 24, height: 24, playOnLoad: true), tooltip: 'Sign out')]), body: ListView(padding: const EdgeInsets.all(24), children: [
      Text('Welcome ${user['displayName'] ?? user['email'] ?? ''}', style: Theme.of(context).textTheme.headlineSmall),
      Text('Active role: $currentRole'),
      if (currentRole == 'PROCURER') const ListTile(title: Text('Procurer workspace'), subtitle: Text('Application and invitation flows are connected. Profile, service-area, orders, earnings, and payout APIs are not active yet.')),
      if (currentRole == 'CUSTOMER') const ListTile(title: Text('Customer workspace'), subtitle: Text('Registration and account security are connected. Shopping lists, discovery, orders, checkout, and messaging APIs are not active yet.')),
      if (currentRole == 'ADMIN') const ListTile(title: Text('Administration workspace'), subtitle: Text('The backend does not currently expose an administrator application-review screen in this mobile app.')),
      if (currentRole == 'SUPER_ADMIN') const ListTile(title: Text('Super Administrator'), subtitle: Text('Staff invitations and access controls are available. Mobile permission editing and audit-log views are not implemented.')),
      if (currentRole == 'SUPER_ADMIN') FilledButton(onPressed: () => Navigator.pushNamed(context, '/admin/staff'), child: const Text('Manage staff')),
      OutlinedButton.icon(onPressed: () => Navigator.pushNamed(context, '/security'), icon: const BuytivaLordicon(assetPath: lordiconCheck, label: 'Security settings', width: 24, height: 24, playOnLoad: true), label: const Text('Security settings')),
    ]));
  }
}
