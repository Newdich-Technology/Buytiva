import 'package:flutter/material.dart';

import 'auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _provider = AuthProvider();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _code = TextEditingController();

  @override
  void initState() {
    super.initState();
    _provider.addListener(_refresh);
  }

  void _refresh() { if (mounted) setState(() {}); }

  @override
  void dispose() {
    _provider.removeListener(_refresh);
    _provider.dispose();
    _email.dispose();
    _password.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _submitCredentials() async {
    await _provider.signIn(_email.text.trim(), _password.text);
    if (_provider.session != null && mounted) Navigator.pushReplacementNamed(context, _provider.passwordChangeRequired ? '/change-password' : '/home');
  }

  Future<void> _submitCode() async {
    await _provider.verifyCode(_code.text.trim());
    if (_provider.session != null && mounted) Navigator.pushReplacementNamed(context, _provider.passwordChangeRequired ? '/change-password' : '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 480), child: ListView(padding: const EdgeInsets.all(24), shrinkWrap: true, children: [
      Text('BUYTIVA', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 12),
      Text(_provider.challengeToken == null ? 'Sign in to your account' : 'Secure account verification'),
      if (_provider.errorMessage != null) Text(_provider.errorMessage!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
      if (_provider.challengeToken == null) ...[
        TextField(controller: _email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.username], decoration: const InputDecoration(labelText: 'Email')),
        TextField(controller: _password, obscureText: true, autofillHints: const [AutofillHints.password], decoration: const InputDecoration(labelText: 'Password')),
        const SizedBox(height: 16),
        FilledButton(onPressed: _provider.isBusy ? null : _submitCredentials, child: const Text('Sign in')),
        TextButton(onPressed: () => Navigator.pushNamed(context, '/register'), child: const Text('Create customer account')),
        TextButton(onPressed: () => Navigator.pushNamed(context, '/procurer-application'), child: const Text('Apply to become a procurer')),
        TextButton(onPressed: () => Navigator.pushNamed(context, '/invitation'), child: const Text('Accept staff invitation')),
        TextButton(onPressed: () => Navigator.pushNamed(context, '/password-recovery'), child: const Text('Forgot password?')),
      ] else if (_provider.challengeType == 'MFA_ENROLLMENT' && _provider.authenticatorUri == null) ...[
        const Text('Set up an authenticator to secure this account.'),
        FilledButton(onPressed: _provider.isBusy ? null : _provider.startEnrollment, child: const Text('Set up authenticator')),
      ] else ...[
        if (_provider.authenticatorSecret != null) SelectableText('Authenticator secret: ${_provider.authenticatorSecret}'),
        if (_provider.authenticatorUri != null) SelectableText('Authenticator setup: ${_provider.authenticatorUri}'),
        TextField(controller: _code, keyboardType: TextInputType.number, autofillHints: const [AutofillHints.oneTimeCode], decoration: const InputDecoration(labelText: '6-digit authenticator code')),
        FilledButton(onPressed: _provider.isBusy ? null : _submitCode, child: const Text('Verify')),
      ],
    ])))));
  }
}
