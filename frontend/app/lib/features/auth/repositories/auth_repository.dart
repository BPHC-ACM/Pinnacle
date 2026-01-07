import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/storage_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final Dio _dio = ApiClient().client;
  final StorageService _storage = StorageService();

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  AuthRepository() {
    _initGoogleSignIn();
  }

  Future<void> _initGoogleSignIn() async {
    print("AuthRepository: Initializing Google Sign In...");
    try {
      // FIX: Used the actual GOOGLE_CLIENT_ID from backend/.env
      const String clientId =
          '785529750770-7uipd15ri97e7jmuni87f7ukpsbud5tn.apps.googleusercontent.com';

      print("AuthRepository: Using Server Client ID: $clientId");

      // The serverClientId is required to get a valid idToken for the backend
      await _googleSignIn.initialize(
        serverClientId: clientId,
      );
      print("AuthRepository: Google Sign In initialized successfully.");
    } catch (e) {
      print("AuthRepository: Error initializing Google Sign In: $e");
    }
  }

  Future<void> loginWithGoogle() async {
    print("AuthRepository: loginWithGoogle() called.");
    try {
      print("AuthRepository: Starting authentication flow...");

      // Note: If you are using google_sign_in < 7.0.0, use .signIn() instead of .authenticate()
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate();

      print("AuthRepository: User selected: ${googleUser.email}");

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      print("AuthRepository: Authentication details obtained.");

      final String? idToken = googleAuth.idToken;

      if (idToken != null) {
        print(
          "AuthRepository: ID Token obtained (starts with): ${idToken.substring(0, 10)}...",
        );
        print(
          "AuthRepository: Sending ID token to backend /auth/google/mobile-login...",
        );

        // Send to your backend
        final response = await _dio.post(
          '/auth/google/mobile-login',
          data: {
            'idToken': idToken,
          },
        );

        print(
          "AuthRepository: Backend response status: ${response.statusCode}",
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          final accessToken = response.data['accessToken'];
          print("AuthRepository: Access Token received.");
          await _storage.saveToken(accessToken);
          print("AuthRepository: Token saved to storage.");
        } else {
          print("AuthRepository: Backend returned error: ${response.data}");
          throw Exception(
            "Backend login failed with status ${response.statusCode}",
          );
        }
      } else {
        print(
          "AuthRepository: ID Token is NULL! Check serverClientId configuration.",
        );
        throw Exception("Failed to retrieve ID Token from Google");
      }
    } catch (e) {
      if (e is GoogleSignInException &&
          e.code == GoogleSignInExceptionCode.canceled) {
        print("AuthRepository: User cancelled login flow.");
        return;
      }
      print("AuthRepository: Login Error: $e");
      rethrow;
    }
  }

  Future<User> getMe() async {
    print("AuthRepository: getMe() called.");
    try {
      final response = await _dio.get('/auth/me');
      print("AuthRepository: getMe response received.");
      return User.fromJson(response.data['user']);
    } catch (e) {
      print("AuthRepository: getMe failed: $e");
      throw Exception('Failed to fetch profile');
    }
  }

  Future<void> logout() async {
    print("AuthRepository: logout() called.");
    try {
      await _dio.post('/auth/logout');
    } catch (e) {
      print("AuthRepository: Logout network error (ignored): $e");
    } finally {
      await _storage.clearAll();
      print("AuthRepository: Storage cleared.");
    }
  }
}
