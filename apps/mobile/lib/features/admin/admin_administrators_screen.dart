import 'package:flutter/material.dart';

import '../../core/auth/secure_session_store.dart';
import '../../core/network/api_error.dart';
import '../../constants/auth_constants.dart';
import '../auth/auth_repository.dart';

class AdminAdministratorsScreen extends StatefulWidget {
  const AdminAdministratorsScreen({super.key});

  @override
  State<AdminAdministratorsScreen> createState() => _AdminAdministratorsScreenState();
}

class _AdminAdministratorsScreenState extends State<AdminAdministratorsScreen> {
  final _repository = AuthRepository();
  final _store = const SecureSessionStore();
  final _email = TextEditingController();
  final _name = TextEditingController();
  final _reason = TextEditingController();
  List<Map<String, dynamic>> _staff = [];
  Map<String, dynamic> _profiles = {};
  String _role = 'ADMIN';
  String? _profile;
  String? _error;
  bool _busy = false;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() { _email.dispose(); _name.dispose(); _reason.dispose(); super.dispose(); }

  Future<String?> _accessToken() async {
    final session = await _store.read();
    return session?['accessToken'] as String?;
  }

  Future<void> _load() async {
    final token = await _accessToken();
    if (token == null) { setState(() => _error = authClientErrorMessages['sessionRequired']); return; }
    setState(() { _busy = true; _error = null; });
    try {
      final values = await Future.wait([_repository.listStaff(token), _repository.getStaffPermissions(token)]);
      _staff = (values[0] as List<dynamic>).map((value) => value as Map<String, dynamic>).toList();
      _profiles = (values[1] as Map<String, dynamic>)['profiles'] as Map<String, dynamic>;
      _profile ??= _profiles.isEmpty ? null : _profiles.keys.first as String;
    } on ApiError catch (error) { _error = error.message; } catch (_) { _error = authClientErrorMessages['staffLoadFailed']; }
    setState(() => _busy = false);
  }

  Future<void> _invite() async {
    final token = await _accessToken();
    if (token == null) return;
    setState(() { _busy = true; _error = null; });
    try {
      await _repository.inviteStaff(token, email: _email.text.trim(), displayName: _name.text.trim(), reason: _reason.text.trim(), role: _role, permissionProfile: _profile);
      _email.clear(); _name.clear(); _reason.clear();
      await _load();
    } on ApiError catch (error) { setState(() => _error = error.message); } catch (_) { setState(() => _error = authClientErrorMessages['staffInviteFailed']); }
    setState(() => _busy = false);
  }

  Future<void> _updateStaff(String userId, String action) async {
    final token = await _accessToken();
    if (token == null) return;
    setState(() { _busy = true; _error = null; });
    try {
      await _repository.updateStaffState(token, userId, _reason.text.trim(), action);
      _reason.clear();
      await _load();
    } on ApiError catch (error) { setState(() => _error = error.message); } catch (_) { setState(() => _error = authClientErrorMessages['staffActionFailed']); }
    setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Staff management'), actions: [IconButton(onPressed: _busy ? null : _load, icon: const Icon(Icons.refresh))]), body: ListView(padding: const EdgeInsets.all(20), children: [
    if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Staff email')),
    TextField(controller: _name, decoration: const InputDecoration(labelText: 'Display name')),
    DropdownButtonFormField<String>(value: _role, items: const [DropdownMenuItem(value: 'ADMIN', child: Text('Administrator')), DropdownMenuItem(value: 'SUPER_ADMIN', child: Text('Super Administrator'))], onChanged: (value) => setState(() => _role = value ?? 'ADMIN'), decoration: const InputDecoration(labelText: 'Role')),
    if (_role == 'ADMIN' && _profiles.isNotEmpty) DropdownButtonFormField<String>(value: _profile, items: _profiles.keys.map((key) => DropdownMenuItem(value: key as String, child: Text(key))).toList(), onChanged: (value) => setState(() => _profile = value), decoration: const InputDecoration(labelText: 'Permission profile')),
    TextField(controller: _reason, minLines: 1, maxLines: 3, decoration: const InputDecoration(labelText: 'Reason for access change')),
    FilledButton(onPressed: _busy ? null : _invite, child: const Text('Send staff invitation')),
    const Divider(),
    for (final member in _staff) _staffCard(member),
  ]));

  Widget _staffCard(Map<String, dynamic> member) {
    final roles = (member['roles'] as List<dynamic>? ?? []).join(', ');
    final status = member['status'] as String? ?? 'UNKNOWN';
    return Card(child: ListTile(title: Text(member['displayName'] as String? ?? member['email'] as String), subtitle: Text('$roles · $status\nPermissions: ${(member['permissions'] as List<dynamic>? ?? []).join(', ')}'), isThreeLine: true, trailing: PopupMenuButton<String>(enabled: !_busy, onSelected: (action) => _updateStaff(member['id'] as String, action), itemBuilder: (_) => [if (status == 'ACTIVE') const PopupMenuItem(value: 'suspend', child: Text('Suspend')), if (status != 'REVOKED') const PopupMenuItem(value: 'revoke', child: Text('Revoke'))])));
  }
}
