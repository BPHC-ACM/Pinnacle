import 'dart:io';
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

  // REMOVED: static final variables that read .env too early
  // static final String _serverClientId = dotenv.env["GOOGLE_CLIENT_ID"] ?? '';
  // static final String _iosClientId = dotenv.env["IOS_CLIENT_ID"] ?? '';

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  AuthRepository() {
    _initGoogleSignIn();
  }

  Future<void> _initGoogleSignIn() async {
    try {
      logger.d("AuthRepository: Initializing Google Sign In (v7)...");

      // FIX: Read env variables here to ensure dotenv is loaded
      final String serverClientId = dotenv.env["GOOGLE_CLIENT_ID"] ?? '';
      final String iosClientId = dotenv.env["IOS_CLIENT_ID"] ?? '';

      if (serverClientId.isEmpty) {
        logger.e("AuthRepository: GOOGLE_CLIENT_ID is empty! Check .env file.");
      }

      await _googleSignIn.initialize(
        serverClientId: serverClientId,
        clientId: Platform.isIOS ? iosClientId : null,
      );

      logger.i("AuthRepository: Google Sign In initialized.");
    } catch (e) {
      logger.e("AuthRepository: Error initializing Google Sign In", error: e);
    }
  }

  Future<void> loginWithGoogle() async {
    logger.d("AuthRepository: loginWithGoogle() called.");
    try {
      // 1. Trigger Google Sign In Flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.authenticate();

      // Check if user is null (just in case)
      if (googleUser == null) {
         logger.w("AuthRepository: Google Sign In returned null.");
         return;
      }

      logger.i("AuthRepository: User selected: ${googleUser.email}");

      // 2. Get Authentication Details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        logger.e("AuthRepository: ID Token is NULL. Check scopes and console config.");
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
        throw Exception("Backend login failed with status ${response.statusCode}");
      }
    } catch (e) {
      if (e.toString().contains('canceled') || e.toString().contains('cancelled')) {
        logger.w("AuthRepository: User cancelled login flow.");
        return;
      }
      logger.e("AuthRepository: Login Error", error: e);
      rethrow;
    }
  }

  // ... rest of the file (getMe, logout) remains the same
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
        return Response(requestOptions: RequestOptions(path: ''), statusCode: 200);
      });
    } finally {
      await _storage.clearAll();
      await _googleSignIn.signOut();
      logger.i("AuthRepository: Session cleared.");
    }
  }
}