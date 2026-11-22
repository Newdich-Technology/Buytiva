import 'package:flutter/material.dart';

bool prefersReducedMotion(BuildContext context) =>
    MediaQuery.disableAnimationsOf(context) ||
    WidgetsBinding.instance.platformDispatcher.accessibilityFeatures.reduceMotion;
