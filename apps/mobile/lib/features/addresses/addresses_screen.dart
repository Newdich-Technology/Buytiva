import 'package:flutter/material.dart';
import '../../core/auth/secure_session_store.dart';
import 'address_form_screen.dart';
import 'address_repository.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key, this.repository, this.tokenLoader});
  final AddressRepository? repository;
  final Future<String?> Function()? tokenLoader;

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  late final AddressRepository _repository;
  String? _token, _error;
  List<Map<String, dynamic>> _addresses = [];
  String? _preferredId;
  int _offset = 0;
  bool _busy = true;
  static const _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _repository = widget.repository ?? AddressRepository();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _busy = true; _error = null; });
    try {
      _token = widget.tokenLoader != null ? await widget.tokenLoader!() : (await const SecureSessionStore().read())?['accessToken'] as String?;
      if (_token == null || _token!.isEmpty) { throw StateError('Please sign in to manage addresses.'); }
      final results = await Future.wait([_repository.list(_token!, offset: _offset, limit: _pageSize), _repository.preferred(_token!)]);
      if (mounted) {
        setState(() {
          _addresses = results[0] as List<Map<String, dynamic>>;
          _preferredId = (results[1] as Map<String, dynamic>?)?['id'] as String?;
        });
      }
    } catch (error) { if (mounted) setState(() => _error = error.toString()); }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _save([Map<String, dynamic>? address]) async {
    final input = await Navigator.push<AddressInput>(context, MaterialPageRoute(builder: (_) => AddressFormScreen(address: address)));
    if (input == null || !mounted) return;
    await _act(() async {
      if (address == null) { await _repository.create(_token!, input); }
      else { await _repository.update(_token!, address['id'] as String, input); }
    });
  }

  Future<void> _delete(Map<String, dynamic> address) async {
    final confirmed = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
      title: const Text('Delete address?'), content: Text('Delete ${address['label']}?'),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete'))]));
    if (confirmed == true && mounted) await _act(() => _repository.delete(_token!, address['id'] as String));
  }

  Future<void> _act(Future<void> Function() operation) async {
    setState(() { _busy = true; _error = null; });
    try { await operation(); await _load(); }
    catch (error) { if (mounted) setState(() { _error = error.toString(); _busy = false; }); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Delivery addresses')),
    body: ListView(padding: const EdgeInsets.all(20), children: [
      if (_busy) const LinearProgressIndicator(),
      if (_error != null) ...[Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        TextButton(onPressed: _busy ? null : _load, child: const Text('Try again'))],
      if (!_busy && _error == null && _addresses.isEmpty) const Text('No saved addresses on this page.'),
      for (final address in _addresses) Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${address['label']}${address['id'] == _preferredId ? ' (Preferred)' : ''}', style: Theme.of(context).textTheme.titleMedium),
        Text('${address['line1']}, ${address['area']}, ${address['city']}, ${address['region']}, ${address['country']}'),
        Wrap(spacing: 8, children: [
          TextButton(onPressed: _busy ? null : () => _save(address), child: const Text('Edit')),
          TextButton(onPressed: _busy || address['id'] == _preferredId ? null : () => _act(() async { await _repository.selectPreferred(_token!, address['id'] as String); }), child: const Text('Set preferred')),
          TextButton(onPressed: _busy ? null : () => _delete(address), child: const Text('Delete')),
        ]),
      ]))),
      Wrap(spacing: 8, children: [
        TextButton(onPressed: _busy || _offset == 0 ? null : () { _offset -= _pageSize; _load(); }, child: const Text('Previous')),
        TextButton(onPressed: _busy || _addresses.length < _pageSize ? null : () { _offset += _pageSize; _load(); }, child: const Text('Next')),
      ]),
      FilledButton(onPressed: _busy || _token == null ? null : () => _save(), child: const Text('Add address')),
    ]),
  );
}
