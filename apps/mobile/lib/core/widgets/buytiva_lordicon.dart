import 'package:flutter/material.dart';
import 'package:lordicon/lordicon.dart';

import '../design_system/motion_preferences.dart';

class BuytivaLordicon extends StatefulWidget {
  const BuytivaLordicon({
    super.key,
    required this.assetPath,
    required this.label,
    this.width = 48,
    this.height = 48,
    this.playOnLoad = false,
    this.playKey = 0,
    this.staticFallback,
  });

  final String assetPath;
  final String label;
  final double width;
  final double height;
  final bool playOnLoad;
  final int playKey;
  final Widget? staticFallback;

  @override
  State<BuytivaLordicon> createState() => _BuytivaLordiconState();
}

class _BuytivaLordiconState extends State<BuytivaLordicon> with WidgetsBindingObserver {
  late IconController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = _createController(widget.assetPath);
    _controller.addStatusListener(_handleControllerStatus);
  }

  IconController _createController(String path) => path.startsWith('http') ? IconController.network(path) : IconController.assets(path);

  @override
  void didUpdateWidget(covariant BuytivaLordicon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.assetPath != widget.assetPath) {
      _disposeController(_controller);
      _controller = _createController(widget.assetPath);
      _controller.addStatusListener(_handleControllerStatus);
      setState(() => _ready = false);
    }
    if (oldWidget.playKey != widget.playKey && widget.playKey > 0 && _ready && !_reducedMotion) {
      _controller.playFromBeginning();
    }
  }

  bool get _reducedMotion => prefersReducedMotion(context);

  @override
  void didChangeAccessibilityFeatures() {
    if (mounted) setState(() {});
    if (_reducedMotion && _ready) _controller.goToLastFrame();
  }

  void _handleControllerStatus(ControllerStatus status) {
    if (status != ControllerStatus.ready || !mounted) return;
    setState(() => _ready = true);
    if (_reducedMotion) {
      _controller.goToLastFrame();
    } else if (widget.playOnLoad) {
      _controller.playFromBeginning();
    }
  }

  @override
  void dispose() {
    _disposeController(_controller);
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void _disposeController(IconController controller) {
    controller.removeStatusListener(_handleControllerStatus);
    controller.clearStatusListeners();
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_reducedMotion || !_ready) return _buildFallback();
    return Semantics(
      image: true,
      label: widget.label,
      child: IconViewer(controller: _controller, width: widget.width, height: widget.height),
    );
  }

  Widget get _fallbackIcon {
    if (widget.staticFallback != null) return widget.staticFallback!;
    final icon = switch (widget.assetPath.split('/').last) {
      'cart.json' => Icons.shopping_basket_outlined,
      'location.json' => Icons.location_on_outlined,
      'check.json' => Icons.check_circle_outline,
      'warning.json' => Icons.warning_amber_outlined,
      'spinner.json' => Icons.refresh,
      'theme.json' => Icons.brightness_6_outlined,
      'person_exit.json' => Icons.logout,
      'home.json' => Icons.home_outlined,
      'search.json' => Icons.search,
      _ => Icons.auto_awesome_outlined,
    };
    return Icon(icon, size: 28);
  }

  Widget _buildFallback() => Semantics(
        image: true,
        label: widget.label,
        child: SizedBox(
          width: widget.width,
          height: widget.height,
          child: Center(child: _fallbackIcon),
        ),
      );
}
