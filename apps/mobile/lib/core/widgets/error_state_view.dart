import 'package:flutter/material.dart';

import '../design_system/error_catalog.dart';
import '../design_system/design_tokens.g.dart';

class ErrorStateView extends StatelessWidget {
  const ErrorStateView({super.key, required this.state, this.onRetry, this.onLogin});

  final BuytivaErrorState state;
  final VoidCallback? onRetry;
  final VoidCallback? onLogin;

  @override
  Widget build(BuildContext context) {
    final isSerious = state.severity == 'critical';
    final action = state.primaryAction == 'login' ? onLogin : onRetry;
    final label = state.primaryAction == 'login' ? 'Log in' : 'Try again';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ErrorIllustration(state: state),
            const SizedBox(height: 24),
            Text(state.title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Text(state.body, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge),
            if (action != null) ...[
              const SizedBox(height: 20),
              FilledButton(onPressed: action, child: Text(label)),
            ],
            if (isSerious) const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _ErrorIllustration extends StatelessWidget {
  const _ErrorIllustration({required this.state});
  final BuytivaErrorState state;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final blue = dark ? BuytivaDesignTokens.darkActionPrimary : BuytivaDesignTokens.lightActionPrimary;
    final accent = dark ? BuytivaDesignTokens.darkAccentLime : BuytivaDesignTokens.lightAccentLime;
    final coral = dark ? BuytivaDesignTokens.darkAccentCoral : BuytivaDesignTokens.lightAccentCoral;
    final ink = dark ? BuytivaDesignTokens.darkTextPrimary : BuytivaDesignTokens.lightTextPrimary;
    final paper = dark ? BuytivaDesignTokens.darkBackgroundSurface : BuytivaDesignTokens.lightBackgroundSurface;
    return Semantics(
      image: true,
      label: 'Buytiva ${state.illustration.replaceAll('_', ' ')} illustration',
      child: SizedBox(
        width: 210,
        height: 160,
        child: CustomPaint(painter: _ErrorArtPainter(illustration: state.illustration, blue: blue, accent: accent, coral: coral, ink: ink, paper: paper)),
      ),
    );
  }
}

class _ErrorArtPainter extends CustomPainter {
  const _ErrorArtPainter({required this.illustration, required this.blue, required this.accent, required this.coral, required this.ink, required this.paper});

  final String illustration;
  final Color blue;
  final Color accent;
  final Color coral;
  final Color ink;
  final Color paper;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(30)), Paint()..color = blue.withValues(alpha: .1));
    final route = Paint()..color = blue..strokeWidth = 5..strokeCap = StrokeCap.round..style = PaintingStyle.stroke;
    final group = _illustrationGroup();
    if (group == 'route') canvas.drawPath(Path()..moveTo(12, 136)..cubicTo(44, 24, 155, 14, 192, 88)..cubicTo(210, 123, 185, 144, 160, 144), route);
    if (group == 'paper' || group == 'document') _drawPaper(canvas);
    if (group == 'access') _drawKey(canvas);
    if (group == 'clock') _drawClock(canvas);
    if (group == 'message') _drawMessage(canvas);
    if (group == 'payment') _drawPayment(canvas);
    if (group == 'parcel') _drawParcel(canvas);
    if (group == 'ribbon') _drawRibbon(canvas);
  }

  @override
  String _illustrationGroup() {
    if (illustration.contains('key') || illustration.contains('lock') || illustration.contains('door')) return 'access';
    if (illustration.contains('clock') || illustration.contains('mail')) return 'clock';
    if (illustration.contains('route') || illustration.contains('map') || illustration.contains('arrow') || illustration.contains('signpost')) return 'route';
    if (illustration.contains('folder') || illustration.contains('file') || illustration.contains('form')) return 'document';
    if (illustration.contains('speech') || illustration.contains('meeting') || illustration.contains('buddy')) return 'message';
    if (illustration.contains('receipt') || illustration.contains('jars')) return 'payment';
    if (illustration.contains('parcel')) return 'parcel';
    if (illustration.contains('ribbon')) return 'ribbon';
    return 'paper';
  }

  void _drawPaper(Canvas canvas) {
    final page = Path()..moveTo(38, 30)..lineTo(126, 38)..lineTo(117, 139)..lineTo(30, 132)..close();
    canvas.drawPath(page, Paint()..color = paper);
    canvas.drawPath(page, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 4);
    final rows = Paint()..color = blue.withValues(alpha: .35)..strokeWidth = 5..strokeCap = StrokeCap.round;
    for (var row = 0; row < 3; row++) {
      final y = 69.0 + row * 18;
      canvas.drawLine(Offset(53, y), Offset(103 - row * 9, y + 4), rows);
    }
    canvas.drawCircle(const Offset(162, 46), 20, Paint()..color = accent);
    _drawCheck(canvas, const Offset(162, 46));
  }

  void _drawKey(Canvas canvas) {
    canvas.drawCircle(const Offset(92, 89), 43, Paint()..color = coral);
    canvas.drawCircle(const Offset(92, 89), 17, Paint()..color = paper);
    final key = Paint()..color = ink..strokeWidth = 12..strokeCap = StrokeCap.round;
    canvas.drawLine(const Offset(126, 116), const Offset(205, 154), key);
    canvas.drawLine(const Offset(179, 142), const Offset(166, 159), key..strokeWidth = 7);
  }

  void _drawClock(Canvas canvas) {
    canvas.drawCircle(const Offset(105, 84), 56, Paint()..color = accent);
    canvas.drawCircle(const Offset(105, 84), 56, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 5);
    final hands = Paint()..color = blue..strokeWidth = 6..strokeCap = StrokeCap.round;
    canvas.drawLine(const Offset(105, 84), const Offset(105, 51), hands);
    canvas.drawLine(const Offset(105, 84), const Offset(132, 101), hands);
  }

  void _drawMessage(Canvas canvas) {
    final bubble = RRect.fromRectAndRadius(const Rect.fromLTWH(36, 44, 137, 90), const Radius.circular(25));
    canvas.drawRRect(bubble, Paint()..color = paper);
    canvas.drawRRect(bubble, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 4);
    for (var dot = 0; dot < 3; dot++) canvas.drawCircle(Offset(77 + dot * 27, 88), 6, Paint()..color = [blue, coral, accent][dot]);
  }

  void _drawPayment(Canvas canvas) {
    final receipt = RRect.fromRectAndRadius(const Rect.fromLTWH(43, 28, 113, 125), const Radius.circular(10));
    canvas.drawRRect(receipt, Paint()..color = paper);
    canvas.drawRRect(receipt, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 4);
    canvas.drawCircle(const Offset(165, 123), 30, Paint()..color = accent);
    _drawText(canvas, '₦', const Offset(154, 103), ink, 34);
  }

  void _drawParcel(Canvas canvas) {
    final parcel = RRect.fromRectAndRadius(const Rect.fromLTWH(39, 52, 129, 96), const Radius.circular(12));
    canvas.drawRRect(parcel, Paint()..color = accent);
    final tape = Paint()..color = paper..strokeWidth = 9;
    canvas.drawLine(const Offset(103, 53), const Offset(103, 147), tape);
    canvas.drawLine(const Offset(41, 91), const Offset(166, 91), tape..strokeWidth = 6);
  }

  void _drawRibbon(Canvas canvas) {
    final ribbon = Paint()..color = blue..style = PaintingStyle.stroke..strokeWidth = 13..strokeCap = StrokeCap.round;
    canvas.drawPath(Path()..moveTo(38, 121)..cubicTo(38, 42, 112, 26, 145, 79)..cubicTo(183, 143, 257, 134, 179, 75)..cubicTo(137, 43, 211, 12, 234, 85), ribbon);
  }

  void _drawCheck(Canvas canvas, Offset origin) {
    final check = Paint()..color = ink..strokeWidth = 4..strokeCap = StrokeCap.round;
    canvas.drawLine(origin.translate(-9, 1), origin.translate(-2, 8), check);
    canvas.drawLine(origin.translate(-2, 8), origin.translate(11, -9), check);
  }

  void _drawText(Canvas canvas, String text, Offset offset, Color color, double size) {
    final painter = TextPainter(text: TextSpan(text: text, style: TextStyle(color: color, fontSize: size, fontWeight: FontWeight.w800)), textDirection: TextDirection.ltr)..layout();
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _ErrorArtPainter oldDelegate) => oldDelegate.illustration != illustration || oldDelegate.blue != blue || oldDelegate.accent != accent || oldDelegate.coral != coral || oldDelegate.ink != ink || oldDelegate.paper != paper;
}
