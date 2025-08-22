#!/bin/bash

echo "🔄 Removing Prisma dependencies and migrating to pure Supabase..."
echo ""

# Remove Prisma dependencies from package.json
echo "📦 Removing Prisma packages..."
npm uninstall @prisma/client prisma

# Remove Prisma scripts from package.json (manually)
echo "✏️  Remove these lines from package.json manually:"
echo '    "db:generate": "prisma generate",'
echo '    "db:migrate": "prisma migrate dev",'
echo '    "db:seed": "prisma db seed"'
echo ""

# Move Prisma directory out of the way
if [ -d "prisma" ]; then
    echo "📁 Moving Prisma directory to prisma.old..."
    mv prisma prisma.old
    echo "   ✅ Prisma schema and migrations backed up"
fi

# Check for remaining Prisma imports
echo "🔍 Checking for remaining Prisma imports..."
remaining_prisma=$(grep -r "import.*@prisma" app/ lib/ 2>/dev/null || true)

if [ -n "$remaining_prisma" ]; then
    echo "❌ Found remaining Prisma imports that need migration:"
    echo "$remaining_prisma"
    echo ""
    echo "Please migrate these files to use Supabase instead."
else
    echo "✅ No remaining Prisma imports found"
fi

# Check for JWT token usage that needs to be replaced with Supabase Auth
echo ""
echo "🔍 Checking for JWT token usage..."
jwt_usage=$(grep -r "jwt\|JWT_SECRET" app/ lib/ 2>/dev/null | grep -v node_modules || true)

if [ -n "$jwt_usage" ]; then
    echo "❌ Found JWT usage that should be replaced with Supabase Auth:"
    echo "$jwt_usage"
    echo ""
    echo "These should be migrated to use Supabase Auth instead."
else
    echo "✅ No JWT usage found"
fi

echo ""
echo "🎉 Prisma removal process initiated!"
echo ""
echo "📋 Manual steps remaining:"
echo "   1. Remove Prisma scripts from package.json"
echo "   2. Migrate any remaining Prisma imports to Supabase"
echo "   3. Replace JWT auth with Supabase Auth"
echo "   4. Test all API endpoints"
echo ""
echo "🚀 After completing these steps, you'll have a pure Supabase architecture!"
