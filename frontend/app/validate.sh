#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

echo "Validating Flutter Code..."
echo "- Checking Formatting..."
dart format --output=none --set-exit-if-changed .

echo "- Running Analyzer..."
flutter analyze

echo "Flutter Validation Passed!"