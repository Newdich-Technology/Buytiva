import 'package:flutter/material.dart';
import 'address_repository.dart';

class AddressFormScreen extends StatefulWidget {
  const AddressFormScreen({super.key, this.address});
  final Map<String, dynamic>? address;

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  final _key = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _fields;
  static const _labels = {
    'label': 'Label', 'line1': 'Address line 1', 'line2': 'Address line 2 (optional)',
    'country': 'Country code (e.g. NG)', 'region': 'Region', 'city': 'City', 'area': 'Area',
  };
  static const _maximum = {'label': 80, 'line1': 200, 'line2': 200, 'country': 2, 'region': 100, 'city': 100, 'area': 100};

  @override
  void initState() {
    super.initState();
    _fields = {for (final key in _labels.keys) key: TextEditingController(text: widget.address?[key] as String? ?? (key == 'country' ? 'NG' : ''))};
  }

  @override
  void dispose() {
    for (final field in _fields.values) { field.dispose(); }
    super.dispose();
  }

  void _submit() {
    if (!_key.currentState!.validate()) return;
    String value(String name) => _fields[name]!.text.trim();
    Navigator.pop(context, AddressInput(label: value('label'), line1: value('line1'),
      line2: value('line2').isEmpty ? null : value('line2'), country: value('country').toUpperCase(),
      region: value('region'), city: value('city'), area: value('area')));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.address == null ? 'Add address' : 'Edit address')),
    body: Form(key: _key, child: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
      for (final entry in _labels.entries) TextFormField(
        controller: _fields[entry.key], maxLength: _maximum[entry.key],
        decoration: InputDecoration(labelText: entry.value),
        validator: (value) {
          final text = value?.trim() ?? '';
          if (entry.key != 'line2' && text.isEmpty) return 'Required';
          if (entry.key == 'country' && !RegExp(r'^[A-Za-z]{2}$').hasMatch(text)) return 'Enter a two-letter country code';
          return null;
        },
      ),
      FilledButton(onPressed: _submit, child: const Text('Save address')),
    ]))),
  );
}
