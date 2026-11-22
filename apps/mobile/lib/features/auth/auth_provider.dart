import 'package:flutter/foundation.dart';

import '../../constants/auth_constants.dart';
import '../../core/network/api_error.dart';
import 'auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({AuthRepository? repository}) : _repository = repository ?? AuthRepository();

  final AuthRepository _repository;
  bool isBusy = false;
  String? errorMessage;
  String? challengeToken;
  String? challengeType;
  String? authenticatorUri;
  String? authenticatorSecret;
  String? applicationReference;
  String? applicationChallengeId;
  Map<String, dynamic>? invitationPreview;
  bool passwordChangeRequired = false;
  Map<String, dynamic>? session;

  Future<void> signIn(String email, String password) => _run(() async {
        final response = await _repository.signIn(email, password);
        if (response['authenticationRequired'] == true) {
          challengeToken = response['challengeToken'] as String;
          challengeType = response['challengeType'] as String;
          passwordChangeRequired = response['passwordChangeRequired'] as bool? ?? false;
          return;
        }
        await _save(response);
      });

  Future<void> startEnrollment() => _run(() async {
        final response = await _repository.enrollTotp(challengeToken!);
        authenticatorUri = response['authenticatorUri'] as String;
        authenticatorSecret = response['secret'] as String;
      });

  Future<void> verifyCode(String code) => _run(() async {
        final response = challengeType == 'MFA_ENROLLMENT'
            ? await _repository.verifyTotpEnrollment(challengeToken!, code)
            : await _repository.completeLogin(challengeToken!, code);
        await _save({'session': response['session'] ?? response});
      });

  Future<void> register(String email, String displayName, String password, bool termsAccepted) =>
      _run(() => _repository.register(email, displayName, password, termsAccepted));

  Future<void> resendEmailOtp(String email) => _run(() => _repository.resendEmailOtp(email));

  Future<void> verifyEmail(String email, String challengeId, String code) =>
      _run(() => _repository.verifyEmail(email, challengeId, code));

  Future<void> submitProcurerApplication(Map<String, dynamic> application) => _run(() async {
        final response = await _repository.submitProcurerApplication(application);
        applicationReference = response['reference'] as String;
        applicationChallengeId = response['challengeId'] as String;
      });

  Future<void> verifyProcurerApplication(String email, String challengeId, String code) =>
      _run(() => _repository.verifyProcurerApplication(email, challengeId, code));

  Future<void> previewInvitation(String token) => _run(() async {
        final preview = await _repository.previewInvitation(token);
        invitationPreview = preview;
      });

  Future<void> acceptInvitation(String token, String password, String confirmPassword) =>
      _run(() => _repository.acceptInvitation(token, password, confirmPassword));

  Future<void> requestPasswordReset(String email) => _run(() => _repository.requestPasswordReset(email));

  Future<void> resetPassword(String token, String password, String confirmPassword) =>
      _run(() => _repository.resetPassword(token, password, confirmPassword));

  Future<void> changePassword(String currentPassword, String password, String confirmPassword) => _run(() async {
        session ??= await _repository.readSession();
        final token = session?['accessToken'] as String?;
        if (token == null) throw const ApiError(authClientErrorMessages['sessionRequired']!);
        await _repository.changePassword(token, currentPassword, password, confirmPassword);
        await _repository.signOut(token);
        session = null;
      });

  Future<void> _save(Map<String, dynamic> response) async {
    await _repository.saveSession(response);
    session = response['session'] as Map<String, dynamic>;
    challengeToken = null;
    challengeType = null;
  }

  Future<void> _run(Future<void> Function() action) async {
    isBusy = true;
    errorMessage = null;
    notifyListeners();
    try { await action(); } on ApiError catch (error) { errorMessage = error.message; } catch (_) { errorMessage = authClientErrorMessages['unexpected']; }
    isBusy = false;
    notifyListeners();
  }
}
