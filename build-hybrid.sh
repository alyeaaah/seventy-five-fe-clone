#!/bin/bash

echo "Building with Vite..."
npm run build

echo "Copying Vite assets..."
mkdir -p vite-assets
cp -r dist/assets vite-assets/
cp dist/*.html vite-assets/ 2>/dev/null || true
cp dist/*.js vite-assets/ 2>/dev/null || true
cp dist/*.webmanifest vite-assets/ 2>/dev/null || true

echo "Building with Next.js..."
npm run build:next

echo "Copying Vite assets to Next.js build..."
cp -r vite-assets/assets dist/
cp vite-assets/*.html dist/ 2>/dev/null || true
cp vite-assets/*.js dist/ 2>/dev/null || true
cp vite-assets/*.webmanifest dist/ 2>/dev/null || true

echo "Getting current asset names..."
JS_FILE=$(find dist/assets -name "index-*.js" | head -1 | sed 's|.*/||')
CSS_FILE=$(find dist/assets -name "index-*.css" | head -1 | sed 's|.*/||')

echo "Updating pages with current asset names..."
if [ ! -z "$JS_FILE" ]; then
    sed -i.bak "s|/assets/index-.*\.js|/assets/$JS_FILE|g" pages/index.tsx
    sed -i.bak "s|/assets/index-.*\.js|/assets/$JS_FILE|g" pages/\[...paths\].tsx
fi

if [ ! -z "$CSS_FILE" ]; then
    sed -i.bak "s|/assets/index-.*\.css|/assets/$CSS_FILE|g" pages/index.tsx
    sed -i.bak "s|/assets/index-.*\.css|/assets/$CSS_FILE|g" pages/\[...paths\].tsx
fi

echo "Rebuilding Next.js with updated asset names..."
npm run build:next

echo "Cleaning up..."
rm -rf vite-assets
rm pages/index.tsx.bak 2>/dev/null || true
rm pages/\[...paths\].tsx.bak 2>/dev/null || true

echo "Build complete!"
echo "JS file: $JS_FILE"
echo "CSS file: $CSS_FILE"
