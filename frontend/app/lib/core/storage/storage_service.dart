import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/logger.dart'; // Import logger

class StorageService {
  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'auth_token';

  // Save Token
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
      logger.d("StorageService: Token saved successfully.");
    } catch (e) {
      logger.e("StorageService: Failed to save token", error: e);
      rethrow;
    }
  }

  // Get Token
  Future<String?> getToken() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      if (token != null) {
        // Log that we found a token, but truncate it for security logs
        final truncated = token.length > 10
            ? "${token.substring(0, 5)}..."
            : "***";
        logger.d("StorageService: Token retrieved ($truncated).");
      } else {
        logger.d("StorageService: No token found.");
      }
      return token;
    } catch (e) {
      logger.e("StorageService: Failed to read token", error: e);
      return null;
    }
  }

  // Clear Session
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
      logger.i("StorageService: All storage cleared.");
    } catch (e) {
      logger.e("StorageService: Failed to clear storage", error: e);
    }
  }
}
