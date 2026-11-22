import '../../core/auth/secure_session_store.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_error.dart';
import '../../constants/auth_constants.dart';

class AuthRepository {
  AuthRepository({ApiClient? api, SecureSessionStore? store}) : _api = api ?? ApiClient(), _store = store ?? const SecureSessionStore();

  final ApiClient _api;
  final SecureSessionStore _store;
  Future<Map<String, dynamic>> signIn(String email, String password) =>
      _api.post(authApiPaths['login']!, {'email': email, 'password': password, 'deviceLabel': mobileDeviceLabel});

  Future<Map<String, dynamic>> completeLogin(String challengeToken, String code) =>
      _api.post(authApiPaths['completeLogin']!, {'challengeToken': challengeToken, 'code': code, 'deviceLabel': mobileDeviceLabel});

  Future<Map<String, dynamic>> enrollTotp(String challengeToken) =>
      _api.post(authApiPaths['enrollTotp']!, {'challengeToken': challengeToken});

  Future<Map<String, dynamic>> verifyTotpEnrollment(String challengeToken, String code) =>
      _api.post(authApiPaths['verifyTotp']!, {'challengeToken': challengeToken, 'code': code, 'deviceLabel': mobileDeviceLabel});

  Future<void> register(String email, String displayName, String password) async {
    await _api.post(authApiPaths['register']!, {'email': email, 'displayName': displayName, 'password': password, 'termsAccepted': true});
  }

  Future<void> verifyEmail(String email, String challengeId, String code) async {
    await _api.post(authApiPaths['emailVerify']!, {'email': email, 'challengeId': challengeId, 'code': code});
  }

  Future<void> requestPasswordReset(String email) async {
    await _api.post(authApiPaths['forgotPassword']!, {'email': email});
  }

  Future<void> resetPassword(String token, String password, String confirmPassword) async {
    await _api.post(authApiPaths['resetPassword']!, {'token': token, 'password': password, 'confirmPassword': confirmPassword});
  }

  Future<void> changePassword(String accessToken, String currentPassword, String password, String confirmPassword) async {
    await _api.post(authApiPaths['changePassword']!, {
      'currentPassword': currentPassword, 'password': password, 'confirmPassword': confirmPassword,
    }, token: accessToken);
  }

  Future<List<dynamic>> listStaff(String accessToken) => _api.getList(staffApiPaths['staff']!, token: accessToken);

  Future<Map<String, dynamic>> getStaffPermissions(String accessToken) => _api.get(staffApiPaths['permissions']!, token: accessToken);

  Future<void> inviteStaff(String accessToken, {required String email, required String displayName, required String reason, required String role, String? permissionProfile}) async {
    final path = staffApiPaths[role == 'SUPER_ADMIN' ? 'inviteSuperAdmin' : 'inviteAdmin']!;
    await _api.post(path, {
      'email': email, 'displayName': displayName, 'reason': reason,
      if (role == 'ADMIN' && permissionProfile != null) 'permissionProfile': permissionProfile,
    }, token: accessToken);
  }

  Future<void> updateStaffState(String accessToken, String userId, String reason, String action) async {
    final path = staffApiPaths[action]!.replaceFirst('{id}', Uri.encodeComponent(userId));
    await _api.post(path, {'reason': reason}, token: accessToken);
  }

  Future<Map<String, dynamic>> submitProcurerApplication(Map<String, dynamic> application) => _api.post(identityApiPaths['submitApplication']!, application);

  Future<void> verifyProcurerApplication(String email, String challengeId, String code) async {
    await _api.post(identityApiPaths['verifyApplicationEmail']!, {'email': email, 'challengeId': challengeId, 'code': code});
  }

  Future<Map<String, dynamic>> previewInvitation(String token) => _api.post(identityApiPaths['previewInvitation']!, {'token': token});

  Future<void> acceptInvitation(String token, String password, String confirmPassword) async {
    await _api.post(identityApiPaths['acceptInvitation']!, {'token': token, 'password': password, 'confirmPassword': confirmPassword});
  }

  Future<void> saveSession(Map<String, dynamic> response) => _store.save(response['session'] as Map<String, dynamic>);

  Future<Map<String, dynamic>?> readSession() => _store.read();

  Future<Map<String, dynamic>?> restoreSession() async {
    final saved = await _store.read();
    if (saved == null) return null;
    try {
      await _api.get(authApiPaths['currentUser']!, token: saved['accessToken'] as String);
      return saved;
    } on ApiError catch (error) {
      if (error.statusCode == 403) return {...saved, 'mustChangePassword': true};
      if (error.statusCode != 401) return saved;
    } catch (_) {
      return saved;
    }
    try {
      final refreshed = await _api.post(authApiPaths['refresh']!, {'refreshToken': saved['refreshToken']});
      await _store.save(refreshed);
      return refreshed;
    } on ApiError catch (error) {
      if (error.statusCode == 401) await _store.clear();
      return null;
    } catch (_) {
      return saved;
    }
  }

  Future<void> signOut(String accessToken) async {
    try { await _api.post(authApiPaths['logout']!, const {}, token: accessToken); } finally { await _store.clear(); }
  }
}
