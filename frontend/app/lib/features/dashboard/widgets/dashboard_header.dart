import 'package:flutter/material.dart';
import '../../../core/components/pinnacle_card.dart';
import '../../auth/models/user_model.dart';

class DashboardHeader extends StatelessWidget {
  final User? user;

  const DashboardHeader({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    return PinnacleCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Welcome back,",
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              // Placeholder for a potential "Edit" or "Settings" icon
              Icon(
                Icons.account_circle_outlined,
                color: Theme.of(context).colorScheme.primary,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            user?.name ?? "Student",
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user?.email ?? "",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
        ],
      ),
    );
  }
}
