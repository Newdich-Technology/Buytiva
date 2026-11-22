import 'package:flutter/material.dart';

import '../../core/design_system/design_tokens.g.dart';

class OnboardingIllustration extends StatelessWidget {
  const OnboardingIllustration({super.key, required this.scene, required this.progress});

  final int scene;
  final double progress;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      image: true,
      label: switch (scene) {
        0 => 'A customer building a shopping list on a phone, with fresh food nearby',
        1 => 'A customer and local procurer connected by a verified route',
        _ => 'A procurer handing a completed order to a happy customer',
      },
      child: CustomPaint(
        painter: _BuytivaScenePainter(scene: scene, progress: progress, dark: dark),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _BuytivaScenePainter extends CustomPainter {
  _BuytivaScenePainter({required this.scene, required this.progress, required this.dark});

  final int scene;
  final double progress;
  final bool dark;

  Color get blue => dark ? BuytivaDesignTokens.darkActionPrimary : BuytivaDesignTokens.lightActionPrimary;
  Color get coral => dark ? BuytivaDesignTokens.darkAccentCoral : BuytivaDesignTokens.lightAccentCoral;
  Color get orange => dark ? BuytivaDesignTokens.darkAccentOrange : BuytivaDesignTokens.lightAccentOrange;
  Color get lilac => dark ? BuytivaDesignTokens.darkAccentLilac : BuytivaDesignTokens.lightAccentLilac;
  Color get lime => dark ? BuytivaDesignTokens.darkAccentLime : BuytivaDesignTokens.lightAccentLime;
  Color get paper => dark ? BuytivaDesignTokens.darkBackgroundSurface : BuytivaDesignTokens.lightBackgroundSurface;
  Color get ink => dark ? BuytivaDesignTokens.darkTextPrimary : BuytivaDesignTokens.lightTextPrimary;

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 360;
    canvas.save();
    canvas.scale(scale, scale);
    final height = size.height / scale;
    final top = (height - 300).clamp(0.0, 80.0).toDouble();
    final bounds = Rect.fromLTWH(0, top, 360, 300);
    final background = Paint()..color = [orange, lilac, coral][scene].withValues(alpha: dark ? .22 : .42);
    canvas.drawRRect(RRect.fromRectAndRadius(bounds, const Radius.circular(38)), background);
    _drawOrbit(canvas, top);
    if (scene == 0) _drawShoppingScene(canvas, top);
    if (scene == 1) _drawMatchingScene(canvas, top);
    if (scene == 2) _drawHandoffScene(canvas, top);
    canvas.restore();
  }

  void _drawOrbit(Canvas canvas, double top) {
    final paint = Paint()..color = paper.withValues(alpha: .8);
    canvas.drawCircle(Offset(306, top + 48), 20, paint);
    canvas.drawCircle(Offset(47, top + 245), 11, Paint()..color = lime);
    final stroke = Paint()
      ..color = blue.withValues(alpha: .22)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawOval(Rect.fromLTWH(24, top + 26, 312, 244), stroke);
  }

  void _drawShoppingScene(Canvas canvas, double top) {
    final lift = (1 - progress) * 18;
    _drawPhone(canvas, Offset(198, top + 41 - lift));
    _drawPerson(canvas, Offset(48, top + 116), scale: .88, shirt: blue);
    _drawProduce(canvas, Offset(284, top + 238 - lift * .4));
    _drawCheck(canvas, Offset(246, top + 66), progress);
  }

  void _drawPhone(Canvas canvas, Offset origin) {
    final frame = Paint()..color = ink;
    final screen = Paint()..color = paper;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(origin.dx, origin.dy, 112, 202), const Radius.circular(22)), frame);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(origin.dx + 6, origin.dy + 7, 100, 188), const Radius.circular(17)), screen);
    _drawText(canvas, 'TODAY’S LIST', Offset(origin.dx + 16, origin.dy + 25), blue, 11);
    for (var row = 0; row < 3; row++) {
      final y = origin.dy + 60 + row * 35;
      canvas.drawCircle(Offset(origin.dx + 21, y + 5), 7, Paint()..color = [coral, orange, lime][row]);
      final line = Paint()..color = ink.withValues(alpha: .7)..strokeWidth = 4..strokeCap = StrokeCap.round;
      canvas.drawLine(Offset(origin.dx + 36, y + 1), Offset(origin.dx + 88, y + 1), line);
      canvas.drawLine(Offset(origin.dx + 36, y + 10), Offset(origin.dx + 72, y + 10), line..color = ink.withValues(alpha: .25));
    }
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(origin.dx + 16, origin.dy + 171, 80, 14), const Radius.circular(7)), Paint()..color = blue);
  }

  void _drawMatchingScene(Canvas canvas, double top) {
    final baseline = top + 234.0;
    final route = Paint()..color = blue..style = PaintingStyle.stroke..strokeWidth = 5..strokeCap = StrokeCap.round;
    final path = Path()..moveTo(103, baseline - 12)..cubicTo(130, baseline - 80, 222, baseline - 82, 256, baseline - 16);
    canvas.drawPath(path, route);
    final reveal = PathMetricProgress(path, progress);
    canvas.drawPath(reveal.path, route..color = coral);
    _drawPerson(canvas, Offset(45, top + 97), scale: .82, shirt: coral);
    _drawPerson(canvas, Offset(232, top + 97), scale: .82, shirt: blue);
    _drawPin(canvas, Offset(180, top + 121));
    _drawCheck(canvas, Offset(258, top + 76), progress);
  }

  void _drawHandoffScene(Canvas canvas, double top) {
    final drift = (1 - progress) * 28;
    _drawPerson(canvas, Offset(34, top + 91), scale: .78, shirt: blue);
    _drawPerson(canvas, Offset(259, top + 91), scale: .78, shirt: coral);
    final box = Rect.fromLTWH(149, top + 153 - drift, 68, 61);
    canvas.drawRRect(RRect.fromRectAndRadius(box, const Radius.circular(8)), Paint()..color = orange);
    final tape = Paint()..color = paper..strokeWidth = 8;
    canvas.drawLine(Offset(183, box.top + 3), Offset(183, box.bottom - 2), tape);
    canvas.drawLine(Offset(box.left + 2, box.top + 23), Offset(box.right - 2, box.top + 23), tape..strokeWidth = 5);
    _drawCheck(canvas, Offset(183, top + 112), progress);
    final bubble = RRect.fromRectAndRadius(Rect.fromLTWH(121, top + 235, 116, 29), const Radius.circular(14));
    canvas.drawRRect(bubble, Paint()..color = paper);
    _drawText(canvas, 'ON THE WAY', Offset(143, top + 244), blue, 10);
  }

  void _drawPerson(Canvas canvas, Offset origin, {required double scale, required Color shirt}) {
    canvas.save();
    canvas.translate(origin.dx, origin.dy);
    canvas.scale(scale);
    final skin = Paint()..color = const Color(0xFFB76D50);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(8, 76, 94, 108), const Radius.circular(34)), Paint()..color = shirt);
    canvas.drawOval(const Rect.fromLTWH(21, 0, 68, 77), skin);
    canvas.drawArc(const Rect.fromLTWH(19, -4, 72, 56), 3.1, 3.0, false, Paint()..color = ink..strokeWidth = 13..style = PaintingStyle.stroke..strokeCap = StrokeCap.round);
    final features = Paint()..color = ink..strokeWidth = 3..strokeCap = StrokeCap.round;
    canvas.drawCircle(const Offset(43, 38), 2.5, features);
    canvas.drawCircle(const Offset(67, 38), 2.5, features);
    canvas.drawArc(const Rect.fromLTWH(45, 39, 20, 14), .2, 2.5, false, features);
    canvas.restore();
  }

  void _drawProduce(Canvas canvas, Offset center) {
    canvas.drawCircle(center, 22, Paint()..color = coral);
    canvas.drawCircle(center.translate(-24, 8), 17, Paint()..color = lime);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: center.translate(25, 8), width: 27, height: 38), const Radius.circular(14)), Paint()..color = orange);
    canvas.drawOval(Rect.fromCenter(center: center.translate(26, -13), width: 12, height: 7), Paint()..color = lime);
  }

  void _drawPin(Canvas canvas, Offset center) {
    final pin = Path()..moveTo(center.dx, center.dy + 25)..cubicTo(center.dx - 35, center.dy - 14, center.dx - 27, center.dy - 42, center.dx, center.dy - 42)..cubicTo(center.dx + 27, center.dy - 42, center.dx + 35, center.dy - 14, center.dx, center.dy + 25)..close();
    canvas.drawPath(pin, Paint()..color = blue);
    canvas.drawCircle(Offset(center.dx, center.dy - 14), 9, Paint()..color = paper);
  }

  void _drawCheck(Canvas canvas, Offset center, double amount) {
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.scale(.6 + amount * .4);
    canvas.drawCircle(Offset.zero, 19, Paint()..color = lime);
    final check = Paint()..color = ink..strokeWidth = 4..strokeCap = StrokeCap.round;
    canvas.drawLine(const Offset(-8, 0), const Offset(-2, 7), check);
    canvas.drawLine(const Offset(-2, 7), const Offset(10, -7), check);
    canvas.restore();
  }

  void _drawText(Canvas canvas, String text, Offset offset, Color color, double size) {
    final painter = TextPainter(text: TextSpan(text: text, style: TextStyle(color: color, fontSize: size, fontWeight: FontWeight.w800, letterSpacing: .7)), textDirection: TextDirection.ltr)..layout();
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _BuytivaScenePainter oldDelegate) => oldDelegate.progress != progress || oldDelegate.dark != dark || oldDelegate.scene != scene;
}

class PathMetricProgress {
  PathMetricProgress(Path path, double progress) : path = _partialPath(path, progress);
  final Path path;

  static Path _partialPath(Path path, double progress) {
    final metric = path.computeMetrics().first;
    return metric.extractPath(0, metric.length * progress.clamp(0, 1).toDouble());
  }
}
