import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/storage_service.dart';
import '../../../core/utils/logger.dart';
import '../models/user_model.dart';

class AuthRepository {
  final Dio _dio = ApiClient().client;
  final StorageService _storage = StorageService();

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  static final String _serverClientId =
      dotenv.env['GOOGLE_CLIENT_ID'] ?? 'default_key';

  AuthRepository() {
    _initGoogleSignIn();
  }

  Future<void> _initGoogleSignIn() async {
    try {
      logger.d(
        "AuthRepository: Initializing Google Sign In with Server Client ID: $_serverClientId",
      );

      await _googleSignIn.initialize(
        serverClientId: _serverClientId,
      );

      logger.i("AuthRepository: Google Sign In initialized successfully.");
    } catch (e) {
      logger.e("AuthRepository: Error initializing Google Sign In", error: e);
    }
  }

  Future<void> loginWithGoogle() async {
    logger.d("AuthRepository: loginWithGoogle() called.");
    try {
      // 1. Trigger Google Sign In Flow
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate();

      logger.i("AuthRepository: User selected: ${googleUser.email}");

      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final String? idToken = googleAuth.idToken;
      logger.d("AuthRepository: Authentication details obtained.");

      if (idToken == null) {
        throw Exception("Failed to retrieve ID Token from Google");
      }

      // 3. Send ID Token to Backend
      logger.d("AuthRepository: Sending ID token to backend...");

      final response = await _dio.post(
        '/auth/google/mobile-login',
        data: {'idToken': idToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final accessToken = response.data['accessToken'];
        final refreshToken = response.data['refreshToken'];

        if (accessToken != null && refreshToken != null) {
          await _storage.saveToken(accessToken);
          await _storage.saveRefreshToken(refreshToken);
          logger.i("AuthRepository: Login successful. Tokens saved.");
        } else {
          throw Exception("Backend did not return expected tokens.");
        }
      } else {
        throw Exception(
          "Backend login failed with status ${response.statusCode}",
        );
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
    try {
      final response = await _dio.get('/auth/me');
      return User.fromJson(response.data['user']);
    } catch (e) {
      logger.e("AuthRepository: getMe failed", error: e);
      throw Exception('Failed to fetch profile');
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout').catchError((e) {
        logger.w("AuthRepository: Backend logout failed (ignoring)", error: e);
        return Response(
          requestOptions: RequestOptions(path: ''),
          statusCode: 200,
        );
      });
    } finally {
      await _storage.clearAll();
      await _googleSignIn.signOut();
      logger.i("AuthRepository: Local session cleared.");
    }
  }
}
