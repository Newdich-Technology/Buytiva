import 'package:flutter/material.dart';

import '../../core/design_system/design_tokens.g.dart';
import '../../core/design_system/motion_preferences.dart';

class ProcurerApplicationIllustration extends StatelessWidget {
  const ProcurerApplicationIllustration({super.key, required this.submitted});

  final bool submitted;

  @override
  Widget build(BuildContext context) {
    final reduced = prefersReducedMotion(context);
    return Semantics(
      image: true,
      label: submitted ? 'Application received; email verification is next' : 'Procurer application form ready to complete',
      child: TweenAnimationBuilder<double>(
        key: ValueKey(submitted),
        tween: Tween(begin: reduced ? 1 : 0, end: 1),
        duration: Duration(milliseconds: reduced ? 0 : BuytivaDesignTokens.successMs),
        builder: (context, progress, _) => CustomPaint(
          painter: _ApplicationArtPainter(submitted: submitted, progress: progress, dark: Theme.of(context).brightness == Brightness.dark),
          child: const SizedBox.expand(),
        ),
      ),
    );
  }
}

class _ApplicationArtPainter extends CustomPainter {
  const _ApplicationArtPainter({required this.submitted, required this.progress, required this.dark});

  final bool submitted;
  final double progress;
  final bool dark;

  @override
  void paint(Canvas canvas, Size size) {
    final primary = dark ? BuytivaDesignTokens.darkActionPrimary : BuytivaDesignTokens.lightActionPrimary;
    final surface = dark ? BuytivaDesignTokens.darkBackgroundSurface : BuytivaDesignTokens.lightBackgroundSurface;
    final ink = dark ? BuytivaDesignTokens.darkTextPrimary : BuytivaDesignTokens.lightTextPrimary;
    final accent = dark ? BuytivaDesignTokens.darkAccentOrange : BuytivaDesignTokens.lightAccentOrange;
    final lilac = dark ? BuytivaDesignTokens.darkAccentLilac : BuytivaDesignTokens.lightAccentLilac;
    canvas.drawRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(24)), Paint()..color = primary.withValues(alpha: dark ? .2 : .1));
    canvas.drawCircle(const Offset(244, 76), 48, Paint()..color = dark ? BuytivaDesignTokens.darkAccentLime : BuytivaDesignTokens.lightAccentLime);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(202, 89, 82, 79), const Radius.circular(27)), Paint()..color = lilac);
    final hair = Path()..moveTo(217, 49)..quadraticBezierTo(218, 25, 242, 25)..quadraticBezierTo(265, 27, 266, 50)..quadraticBezierTo(245, 40, 217, 49)..close();
    final face = Paint()..color = dark ? BuytivaDesignTokens.darkIllustrationSkin : BuytivaDesignTokens.lightIllustrationSkin;
    canvas.drawCircle(const Offset(241, 51), 21, face);
    canvas.drawCircle(const Offset(234, 53), 2.2, Paint()..color = ink);
    canvas.drawCircle(const Offset(249, 53), 2.2, Paint()..color = ink);
    final smile = Path()..moveTo(235, 63)..quadraticBezierTo(242, 69, 249, 63);
    canvas.drawPath(smile, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 2.2..strokeCap = StrokeCap.round);
    canvas.drawPath(hair, Paint()..color = ink);
    final scale = size.width / 320;
    canvas.save();
    canvas.translate((size.width - 320 * scale) / 2, (size.height - 170 * scale) / 2);
    canvas.scale(scale);
    final sheet = RRect.fromRectAndRadius(const Rect.fromLTWH(52, 14, 118, 144), const Radius.circular(13));
    canvas.drawRRect(sheet, Paint()..color = surface);
    canvas.drawRRect(sheet, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 3);
    final lines = Paint()..color = primary.withValues(alpha: .65)..strokeWidth = 5..strokeCap = StrokeCap.round;
    for (var row = 0; row < 4; row++) {
      final y = 47.0 + row * 23;
      canvas.drawCircle(Offset(76, y), 4, Paint()..color = accent);
      canvas.drawLine(Offset(88, y), Offset(row == 3 ? 130 : 150, y), lines);
    }
    final offset = (1 - progress) * 24;
    final mail = Rect.fromLTWH(165 + offset, 82, 103, 60);
    canvas.drawRRect(RRect.fromRectAndRadius(mail, const Radius.circular(10)), Paint()..color = accent);
    final flap = Path()..moveTo(mail.left + 3, mail.top + 5)..lineTo(mail.center.dx, mail.top + 39)..lineTo(mail.right - 3, mail.top + 5);
    canvas.drawPath(flap, Paint()..color = ink..style = PaintingStyle.stroke..strokeWidth = 4..strokeJoin = StrokeJoin.round);
    if (submitted) {
      canvas.drawCircle(const Offset(266, 57), 17, Paint()..color = primary);
      final dot = Paint()..color = surface..strokeWidth = 4..strokeCap = StrokeCap.round;
      canvas.drawLine(const Offset(266, 49), const Offset(266, 58), dot);
      canvas.drawCircle(const Offset(266, 64), 2, Paint()..color = surface);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _ApplicationArtPainter oldDelegate) => oldDelegate.submitted != submitted || oldDelegate.progress != progress || oldDelegate.dark != dark;
}
