#!/bin/bash

# Stop on first error
set -e

echo "🧹 Cleaning up previous installations..."
rm -rf node_modules/.prisma
rm -rf prisma/node_modules
rm -rf .next
rm -rf node_modules

echo "📦 Installing dependencies..."
pnpm install

echo "🔑 Approving build scripts..."
pnpm approve-builds @prisma/client prisma

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Setup complete! You can now run 'pnpm dev' to start your application."