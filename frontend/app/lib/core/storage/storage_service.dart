import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  
  // Save Token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Get Token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Clear Session
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}