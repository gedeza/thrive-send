#!/bin/bash

# Install ts-jest and its dependencies
pnpm add -D ts-jest @types/jest jest-environment-node

# Clear the Jest cache to ensure clean configuration
pnpm exec jest --clearCache

echo "✅ ts-jest and dependencies installed"
echo "✅ Jest cache cleared"
echo "🚀 Try running 'pnpm test:calendar' now"