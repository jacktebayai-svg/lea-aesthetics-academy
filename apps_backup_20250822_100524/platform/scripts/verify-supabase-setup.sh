#!/bin/bash

# Verify Supabase Database Setup
# This script checks that all required tables are accessible

echo "🔍 Verifying Supabase Database Setup..."
echo ""

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing Supabase environment variables"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Expected tables
tables=(
    "business_settings"
    "user_profiles" 
    "clients"
    "students"
    "services"
    "medical_histories"
    "appointments"
    "courses"
    "course_enrollments"
    "payments"
    "templates"
    "documents"
    "campaigns"
    "messages"
    "audit_logs"
    "file_uploads"
)

echo "📋 Checking required tables:"
all_tables_exist=true

for table in "${tables[@]}"; do
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/$table?select=*&limit=0")
    
    if [ "$response" == "200" ]; then
        echo "   ✅ $table: exists"
    else
        echo "   ❌ $table: not accessible (HTTP $response)"
        all_tables_exist=false
    fi
done

echo ""
echo "📊 Checking sample data:"

# Check business settings
response=$(curl -s \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/business_settings")

if echo "$response" | grep -q "LEA Aesthetics Academy"; then
    echo "   ✅ Business settings: found sample data"
else
    echo "   ❌ Business settings: no sample data"
fi

# Check services
services_count=$(curl -s \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/services" | jq '. | length' 2>/dev/null || echo "0")

if [ "$services_count" -gt "0" ]; then
    echo "   ✅ Services: $services_count sample services"
else
    echo "   ❌ Services: no sample data"
fi

# Check courses
courses_count=$(curl -s \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/courses" | jq '. | length' 2>/dev/null || echo "0")

if [ "$courses_count" -gt "0" ]; then
    echo "   ✅ Courses: $courses_count sample courses"
else
    echo "   ❌ Courses: no sample data"
fi

echo ""
echo "🎉 Database Setup Verification Complete!"

if [ "$all_tables_exist" == true ]; then
    echo "✅ All core tables are present and accessible."
    echo "✅ Database is ready for application development."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Resolve Prisma vs Supabase architecture choice"
    echo "   2. Consolidate authentication system"
    echo "   3. Implement business settings API"
    exit 0
else
    echo "❌ Some tables are missing. Please check the database setup."
    exit 1
fi
