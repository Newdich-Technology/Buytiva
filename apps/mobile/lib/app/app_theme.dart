import 'package:flutter/material.dart';
import '../core/design_system/design_tokens.g.dart';

ThemeData buildBuytivaTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: BuytivaDesignTokens.lightActionPrimary,
    brightness: Brightness.light,
    surface: BuytivaDesignTokens.lightBackgroundSurface,
  );
  return ThemeData(
    colorScheme: scheme.copyWith(
      primary: BuytivaDesignTokens.lightActionPrimary,
      onPrimary: BuytivaDesignTokens.lightActionOnPrimary,
      secondary: BuytivaDesignTokens.lightAccentCoral,
      tertiary: BuytivaDesignTokens.lightAccentOrange,
      surface: BuytivaDesignTokens.lightBackgroundSurface,
      error: BuytivaDesignTokens.lightStatusErrorForeground,
    ),
    scaffoldBackgroundColor: BuytivaDesignTokens.lightBackgroundCanvas,
    textTheme: ThemeData.light().textTheme.apply(
      bodyColor: BuytivaDesignTokens.lightTextPrimary,
      displayColor: BuytivaDesignTokens.lightTextPrimary,
      fontFamily: 'DM Sans',
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: BuytivaDesignTokens.lightBackgroundCanvas,
      foregroundColor: BuytivaDesignTokens.lightTextPrimary,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: BuytivaDesignTokens.lightBackgroundSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: BuytivaDesignTokens.lightBorderDefault),
      ),
    ),
    useMaterial3: true,
  );
}

ThemeData buildBuytivaDarkTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: BuytivaDesignTokens.darkActionPrimary,
    brightness: Brightness.dark,
    surface: BuytivaDesignTokens.darkBackgroundSurface,
  );
  return ThemeData(
    colorScheme: scheme.copyWith(
      primary: BuytivaDesignTokens.darkActionPrimary,
      onPrimary: BuytivaDesignTokens.darkActionOnPrimary,
      secondary: BuytivaDesignTokens.darkAccentCoral,
      tertiary: BuytivaDesignTokens.darkAccentOrange,
      surface: BuytivaDesignTokens.darkBackgroundSurface,
      error: BuytivaDesignTokens.darkStatusErrorForeground,
    ),
    scaffoldBackgroundColor: BuytivaDesignTokens.darkBackgroundCanvas,
    textTheme: ThemeData.dark().textTheme.apply(
      bodyColor: BuytivaDesignTokens.darkTextPrimary,
      displayColor: BuytivaDesignTokens.darkTextPrimary,
      fontFamily: 'DM Sans',
    ),
    useMaterial3: true,
  );
}
