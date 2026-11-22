import 'package:flutter/material.dart';

import 'auth_provider.dart';

class ProcurerApplicationScreen extends StatefulWidget {
  const ProcurerApplicationScreen({super.key});

  @override
  State<ProcurerApplicationScreen> createState() => _ProcurerApplicationScreenState();
}

class _ProcurerApplicationScreenState extends State<ProcurerApplicationScreen> {
  final _provider = AuthProvider();
  final _controllers = List.generate(10, (_) => TextEditingController());
  bool _submitted = false;
  bool _consentAccepted = false;

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() { _provider.removeListener(_refresh); _provider.dispose(); for (final c in _controllers) { c.dispose(); } super.dispose(); }

  Future<void> _submit() async {
    await _provider.submitProcurerApplication({
      'email': _controllers[0].text.trim(), 'firstName': _controllers[1].text.trim(), 'lastName': _controllers[2].text.trim(),
      'phone': _controllers[3].text.trim(), 'proposedCountry': _controllers[4].text.trim(), 'proposedCity': _controllers[5].text.trim(),
      'categories': _controllers[6].text.split(',').map((value) => value.trim()).where((value) => value.isNotEmpty).toList(),
      'experience': _controllers[7].text.trim(), 'consentAccepted': _consentAccepted,
    });
    if (_provider.errorMessage == null) {
      _controllers[9].text = _provider.applicationChallengeId ?? '';
      setState(() => _submitted = true);
    }
  }

  Future<void> _verify() async {
    await _provider.verifyProcurerApplication(_controllers[0].text.trim(), _controllers[9].text.trim(), _controllers[8].text.trim());
    if (_provider.errorMessage == null && mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Procurer application')), body: ListView(padding: const EdgeInsets.all(20), children: [
    if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
    if (!_submitted) ...[
      for (final entry in <(String, int)>[('Email', 0), ('First name', 1), ('Last name', 2), ('Phone', 3), ('Country', 4), ('City', 5), ('Categories, comma separated', 6), ('Experience', 7)]) TextField(controller: _controllers[entry.$2], decoration: InputDecoration(labelText: entry.$1)),
      CheckboxListTile(value: _consentAccepted, onChanged: (value) => setState(() => _consentAccepted = value ?? false), title: const Text('I consent to identity and compliance review')),
      FilledButton(onPressed: _provider.isBusy || !_consentAccepted ? null : _submit, child: const Text('Submit application')),
    ] else ...[
      Text('Application reference: ${_provider.applicationReference}'),
      TextField(controller: _controllers[9], decoration: const InputDecoration(labelText: 'Challenge ID')),
      TextField(controller: _controllers[8], decoration: const InputDecoration(labelText: 'Email verification code')),
      FilledButton(onPressed: _provider.isBusy ? null : _verify, child: const Text('Verify email')),
    ],
  ]));
}
