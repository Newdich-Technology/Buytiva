import 'package:flutter/material.dart';

import 'auth_provider.dart';
import 'procurer_application_illustration.dart';

class ProcurerApplicationScreen extends StatefulWidget {
  const ProcurerApplicationScreen({super.key});

  @override
  State<ProcurerApplicationScreen> createState() => _ProcurerApplicationScreenState();
}

class _ProcurerApplicationScreenState extends State<ProcurerApplicationScreen> {
  final _provider = AuthProvider();
  final _controllers = List.generate(11, (_) => TextEditingController());
  int _step = 0;
  bool _submitted = false;
  bool _consentAccepted = false;
  String? _stepError;

  @override
  void initState() { super.initState(); _provider.addListener(_refresh); }
  void _refresh() { if (mounted) setState(() {}); }
  @override
  void dispose() { _provider.removeListener(_refresh); _provider.dispose(); for (final controller in _controllers) { controller.dispose(); } super.dispose(); }

  bool _validateStep() {
    final requiredIndexes = switch (_step) { 0 => [0, 1, 2, 3], 1 => [4, 6], 2 => [8], _ => <int>[] };
    if (requiredIndexes.any((index) => _controllers[index].text.trim().isEmpty)) {
      _stepError = 'Complete the required fields to continue.';
      return false;
    }
    if (_step == 0 && !_controllers[0].text.contains('@')) {
      _stepError = 'Enter a valid email address.';
      return false;
    }
    if (_step == 3 && !_consentAccepted) {
      _stepError = 'Accept the verification declaration to submit.';
      return false;
    }
    _stepError = null;
    return true;
  }

  void _continue() {
    if (!_validateStep()) { setState(() {}); return; }
    setState(() => _step = (_step + 1).clamp(0, 3).toInt());
  }

  void _back() => setState(() { _step = (_step - 1).clamp(0, 3).toInt(); _stepError = null; });

  Future<void> _submit() async {
    if (!_validateStep()) { setState(() {}); return; }
    await _provider.submitProcurerApplication({
      'email': _controllers[0].text.trim(), 'firstName': _controllers[1].text.trim(), 'lastName': _controllers[2].text.trim(),
      'phone': _controllers[3].text.trim(), 'proposedCountry': _controllers[4].text.trim(),
      'proposedRegion': _controllers[5].text.trim(), 'proposedCity': _controllers[6].text.trim(), 'proposedArea': _controllers[7].text.trim(),
      'categories': _controllers[8].text.split(',').map((value) => value.trim()).where((value) => value.isNotEmpty).toList(),
      'experience': _controllers[9].text.trim(), 'consentAccepted': _consentAccepted,
    });
    if (_provider.errorMessage == null) setState(() => _submitted = true);
  }

  Future<void> _verify() async {
    final challengeId = _provider.applicationChallengeId;
    if (challengeId == null) return;
    await _provider.verifyProcurerApplication(_controllers[0].text.trim(), challengeId, _controllers[10].text.trim());
    if (_provider.errorMessage == null && mounted) Navigator.pop(context);
  }

  Widget _field(String label, int index, {TextInputType? keyboardType, String? hint}) => TextField(
    controller: _controllers[index], keyboardType: keyboardType, decoration: InputDecoration(labelText: label, hintText: hint),
  );

  Widget _stepContent() => switch (_step) {
    0 => Column(children: [_field('Email', 0, keyboardType: TextInputType.emailAddress), _field('First name', 1), _field('Last name', 2), _field('Phone', 3, keyboardType: TextInputType.phone)]),
    1 => Column(children: [_field('Country', 4), _field('State or region (optional)', 5), _field('City', 6), _field('Neighborhood or area (optional)', 7)]),
    2 => Column(children: [_field('Categories, comma separated', 8, hint: 'Groceries, home essentials'), _field('Relevant experience (optional)', 9)]),
    _ => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('${_controllers[1].text} ${_controllers[2].text}', style: Theme.of(context).textTheme.titleLarge),
      Text(_controllers[0].text), Text('${_controllers[6].text}, ${_controllers[4].text}'),
      Text('Categories: ${_controllers[8].text}'),
      CheckboxListTile(value: _consentAccepted, onChanged: (value) => setState(() => _consentAccepted = value ?? false), title: const Text('I consent to identity and compliance review')),
    ]),
  };

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Procurer application')),
    body: ListView(padding: const EdgeInsets.all(20), children: [
      SizedBox(height: 145, child: ProcurerApplicationIllustration(submitted: _submitted)),
      if (_submitted) ...[
        const Text('Application received. Verify your email to begin the review process.'),
        Text('Tracking reference: ${_provider.applicationReference}'),
        TextField(controller: _controllers[10], keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Email verification code')),
        FilledButton(onPressed: _provider.isBusy ? null : _verify, child: const Text('Verify email')),
      ] else ...[
        Text('STEP ${_step + 1} OF 4 · ${['About you', 'Service area', 'Experience', 'Review'][_step]}', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 10), LinearProgressIndicator(value: (_step + 1) / 4), const SizedBox(height: 18),
        Text(['Your contact details', 'Where will you serve?', 'Your experience', 'Review and submit'][_step], style: Theme.of(context).textTheme.headlineSmall),
        _stepContent(),
        if (_stepError != null) Text(_stepError!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        Row(children: [if (_step > 0) TextButton(onPressed: _back, child: const Text('Back')), const Spacer(), if (_step < 3) FilledButton(onPressed: _continue, child: const Text('Continue')) else FilledButton(onPressed: _provider.isBusy ? null : _submit, child: const Text('Submit application'))]),
      ],
    ]),
  );
}
