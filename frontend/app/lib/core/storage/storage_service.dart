import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/logger.dart';

class StorageService {
  final _storage = const FlutterSecureStorage();
  static const _accessTokenKey = 'auth_token';
  static const _refreshTokenKey = 'refresh_token';

  // --- Access Token ---

  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _accessTokenKey, value: token);
      logger.d("StorageService: Access token saved.");
    } catch (e) {
      logger.e("StorageService: Failed to save access token", error: e);
      rethrow;
    }
  }

  Future<String?> getToken() async {
    try {
      final token = await _storage.read(key: _accessTokenKey);
      return token;
    } catch (e) {
      logger.e("StorageService: Failed to read access token", error: e);
      return null;
    }
  }

  // --- Refresh Token ---

  Future<void> saveRefreshToken(String token) async {
    try {
      await _storage.write(key: _refreshTokenKey, value: token);
      logger.d("StorageService: Refresh token saved.");
    } catch (e) {
      logger.e("StorageService: Failed to save refresh token", error: e);
      rethrow;
    }
  }

  Future<String?> getRefreshToken() async {
    try {
      return await _storage.read(key: _refreshTokenKey);
    } catch (e) {
      logger.e("StorageService: Failed to read refresh token", error: e);
      return null;
    }
  }

  // --- Clear Session ---

  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
      logger.i("StorageService: All storage cleared.");
    } catch (e) {
      logger.e("StorageService: Failed to clear storage", error: e);
    }
  }
}
