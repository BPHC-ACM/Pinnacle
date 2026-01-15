// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import '../providers/auth_provider.dart';

// class AuthCallbackScreen extends ConsumerStatefulWidget {
//   final Map<String, String> queryParams;

//   const AuthCallbackScreen({super.key, required this.queryParams});

//   @override
//   ConsumerState<AuthCallbackScreen> createState() => _AuthCallbackScreenState();
// }

// class _AuthCallbackScreenState extends ConsumerState<AuthCallbackScreen> {
//   @override
//   void initState() {
//     super.initState();
//     // Process the token immediately
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       _processLogin();
//     });
//   }

//   void _processLogin() {
//     final accessToken = widget.queryParams['access_token'];
//     // final refreshToken = widget.queryParams['refresh_token']; // If needed later

//     if (accessToken != null) {
//       ref.read(authProvider.notifier).handleLoginSuccess(accessToken);
//       // Router redirect logic will automatically move us to /dashboard
//     } else {
//       // Handle error (e.g., user denied access)
//       // Navigate back to login
//       ref.read(authProvider.notifier).logout();
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return const Scaffold(
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             CircularProgressIndicator(),
//             SizedBox(height: 16),
//             Text("Finalizing login..."),
//           ],
//         ),
//       ),
//     );
//   }
// }
