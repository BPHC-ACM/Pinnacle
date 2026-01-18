import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/storage_service.dart';
import '../../../core/utils/logger.dart'; // Import logger
import '../models/user_model.dart';

class AuthRepository {
  final Dio _dio = ApiClient().client;
  final StorageService _storage = StorageService();

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  AuthRepository() {
    _initGoogleSignIn();
  }

  Future<void> _initGoogleSignIn() async {
    logger.d("AuthRepository: Initializing Google Sign In...");
    try {
      const String clientId =
          '785529750770-7uipd15ri97e7jmuni87f7ukpsbud5tn.apps.googleusercontent.com';

      logger.d("AuthRepository: Using Server Client ID: $clientId");

      await _googleSignIn.initialize(
        serverClientId: clientId,
      );
      logger.i("AuthRepository: Google Sign In initialized successfully.");
    } catch (e) {
      logger.e("AuthRepository: Error initializing Google Sign In", error: e);
    }
  }

  Future<void> loginWithGoogle() async {
    logger.d("AuthRepository: loginWithGoogle() called.");
    try {
      logger.d("AuthRepository: Starting authentication flow...");

      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate();

      logger.i("AuthRepository: User selected: ${googleUser.email}");

      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      logger.d("AuthRepository: Authentication details obtained.");

      final String? idToken = googleAuth.idToken;

      if (idToken != null) {
        logger.d(
          "AuthRepository: ID Token obtained (starts with): ${idToken.substring(0, 10)}...",
        );
        logger.d(
          "AuthRepository: Sending ID token to backend /auth/google/mobile-login...",
        );

        final response = await _dio.post(
          '/auth/google/mobile-login',
          data: {
            'idToken': idToken,
          },
        );

        logger.d(
          "AuthRepository: Backend response status: ${response.statusCode}",
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          final accessToken = response.data['accessToken'];
          logger.i("AuthRepository: Access Token received.");
          await _storage.saveToken(accessToken);
          logger.d("AuthRepository: Token saved to storage.");
        } else {
          logger.e("AuthRepository: Backend returned error: ${response.data}");
          throw Exception(
            "Backend login failed with status ${response.statusCode}",
          );
        }
      } else {
        logger.e(
          "AuthRepository: ID Token is NULL! Check serverClientId configuration.",
        );
        throw Exception("Failed to retrieve ID Token from Google");
      }
    } catch (e) {
      if (e is GoogleSignInException &&
          e.code == GoogleSignInExceptionCode.canceled) {
        logger.w("AuthRepository: User cancelled login flow.");
        return;
      }
      logger.e("AuthRepository: Login Error", error: e);
      rethrow;
    }
  }

  Future<User> getMe() async {
    logger.d("AuthRepository: getMe() called.");
    try {
      final response = await _dio.get('/auth/me');
      logger.d("AuthRepository: getMe response received.");
      return User.fromJson(response.data['user']);
    } catch (e) {
      logger.e("AuthRepository: getMe failed", error: e);
      throw Exception('Failed to fetch profile');
    }
  }

  Future<void> logout() async {
    logger.d("AuthRepository: logout() called.");
    try {
      await _dio.post('/auth/logout');
    } catch (e) {
      logger.w("AuthRepository: Logout network error (ignored)", error: e);
    } finally {
      await _storage.clearAll();
      logger.i("AuthRepository: Storage cleared.");
    }
  }
}
