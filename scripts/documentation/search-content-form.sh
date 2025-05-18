#!/bin/bash
echo "Checking if ContentForm has 'use client' directive:"
grep -l "use client" /Users/nhla/Desktop/PROJECTS/2025/thrive-send/src/components/content/ContentForm.tsx || echo "No 'use client' directive found in ContentForm"