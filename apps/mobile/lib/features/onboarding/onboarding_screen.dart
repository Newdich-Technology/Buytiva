import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../core/design_system/design_tokens.g.dart';
import '../../core/design_system/motion_preferences.dart';
import '../auth/login_screen.dart';
import 'onboarding_illustration.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  static const _storage = FlutterSecureStorage();
  static const _slides = [
    ('Anything you need, in one list.', 'Add what you want, set your expected prices, and include any special instructions.'),
    ('Find your shopping partner.', 'Choose a verified procurer serving your delivery area and review their fees.'),
    ('Relax. Your shopping is handled.', 'Pay securely, communicate with your procurer, and follow your order through delivery.'),
  ];

  final PageController _pages = PageController();
  late final AnimationController _sceneMotion = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: BuytivaDesignTokens.illustrationMs),
  )..forward();
  int _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _redirectReturningUser();
  }

  @override
  void didChangeAccessibilityFeatures() {
    if (prefersReducedMotion(context)) _sceneMotion.value = 1;
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _pages.dispose();
    _sceneMotion.dispose();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    await _storage.write(key: 'buytiva_onboarding_complete', value: 'true');
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => const LoginScreen()));
  }

  Future<void> _redirectReturningUser() async {
    final complete = await _storage.read(key: 'buytiva_onboarding_complete');
    if (complete == 'true' && mounted) await _completeOnboarding();
  }

  void _setPage(int value) {
    if (value < 0 || value >= _slides.length) return;
    setState(() => _index = value);
    if (prefersReducedMotion(context)) {
      _sceneMotion.value = 1;
      _pages.jumpToPage(value);
    } else {
      _sceneMotion.forward(from: 0);
      _pages.animateToPage(value, duration: const Duration(milliseconds: BuytivaDesignTokens.normalMs), curve: Curves.easeOutCubic);
    }
  }

  void _continue() {
    if (_index == _slides.length - 1) {
      _completeOnboarding();
      return;
    }
    _setPage(_index + 1);
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = prefersReducedMotion(context);
    if (reduceMotion && _sceneMotion.value != 1) _sceneMotion.value = 1;
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(onPressed: _completeOnboarding, child: const Text('Skip')),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pages,
              itemCount: _slides.length,
              physics: const NeverScrollableScrollPhysics(),
              itemBuilder: (context, index) => _buildSlide(context, index, reduceMotion),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            child: Row(children: [
              if (_index > 0)
                SizedBox(height: 48, child: TextButton(onPressed: () => _setPage(_index - 1), child: const Text('Back')))
              else
                const SizedBox(width: 50),
              const Spacer(),
              ...List.generate(_slides.length, (index) => _progressDot(index, theme)),
              const Spacer(),
              FilledButton(
                onPressed: _continue,
                child: Text(_index == _slides.length - 1 ? 'Get started' : 'Next'),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Color themeForScene(BuildContext context) => Theme.of(context).colorScheme.surface;

  Widget _progressDot(int index, ThemeData theme) => Semantics(
        label: 'Step ${index + 1} of ${_slides.length}',
        selected: index == _index,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: BuytivaDesignTokens.fastMs),
          width: index == _index ? 24 : 8,
          height: 8,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: index == _index ? theme.colorScheme.primary : theme.colorScheme.outlineVariant,
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );

  Widget _buildSlide(BuildContext context, int index, bool reduceMotion) => LayoutBuilder(
        builder: (context, constraints) {
          final copy = _slides[index];
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 22),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  SizedBox(
                    height: (constraints.maxHeight * .53).clamp(210.0, 360.0),
                    width: double.infinity,
                    child: AnimatedBuilder(
                      animation: _sceneMotion,
                      builder: (context, child) => Transform.translate(
                        offset: Offset(0, reduceMotion ? 0 : 12 * (1 - _sceneMotion.value)),
                        child: Opacity(
                          opacity: reduceMotion ? 1 : _sceneMotion.value,
                          child: Stack(children: [
                            Positioned.fill(child: OnboardingIllustration(scene: index, progress: reduceMotion ? 1 : _sceneMotion.value)),
                            Positioned(
                              right: 18, top: 18,
                              child: DecoratedBox(
                                decoration: BoxDecoration(color: themeForScene(context), shape: BoxShape.circle),
                                child: Padding(
                                  padding: const EdgeInsets.all(5),
                                  child: ExcludeSemantics(
                                    child: Icon([Icons.list_alt, Icons.search, Icons.folder_outlined][index], size: 28, color: Theme.of(context).colorScheme.primary),
                                  ),
                                ),
                              ),
                            ),
                          ]),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(copy.$1, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800, height: 1.05)),
                  const SizedBox(height: 12),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 380),
                    child: Text(copy.$2, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant, height: 1.5)),
                  ),
                  const SizedBox(height: 20),
                ]),
              ),
            ),
          );
        },
      );
}
