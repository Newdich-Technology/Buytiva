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
  late final IconController _controller = IconController.assets(widget.assetPath);
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller.addStatusListener(_handleControllerStatus);
  }

  @override
  void didUpdateWidget(covariant BuytivaLordicon oldWidget) {
    super.didUpdateWidget(oldWidget);
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
    _disposeController();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void _disposeController() {
    _controller.removeStatusListener(_handleControllerStatus);
    _controller.clearStatusListeners();
    _controller.dispose();
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

  Widget _buildFallback() => Semantics(
        image: true,
        label: widget.label,
        child: SizedBox(
          width: widget.width,
          height: widget.height,
          child: Center(child: widget.staticFallback ?? _fallbackIcon),
        ),
      );

  Widget get _fallbackIcon {
    final icon = switch (widget.assetPath.split('/').last) {
      'system-outline-56-file-text.json' => Icons.description_outlined,
      'system-outline-19-magnifier.json' => Icons.search,
      'system-outline-120-folder.json' => Icons.folder_outlined,
      _ => Icons.auto_awesome_outlined,
    };
    return Icon(icon, size: 28);
  }
}
