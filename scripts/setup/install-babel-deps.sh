#!/bin/bash

# Install the missing Babel dependencies
pnpm add -D @babel/core @babel/preset-env @babel/preset-typescript @babel/preset-react

# Verify installation
echo "Installed Babel dependencies. Checking versions:"
pnpm list @babel/core @babel/preset-env @babel/preset-typescript @babel/preset-react