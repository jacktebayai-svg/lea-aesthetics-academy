-- ==========================================
-- SEED DATA FOR LUXURY AESTHETICS PLATFORM
-- Initial data for testing and development
-- ==========================================

-- Insert business profile
INSERT INTO public.business_profile (
  id,
  name,
  slug,
  type,
  timezone,
  address,
  phone,
  email,
  website,
  business_hours,
  settings,
  amenities,
  logo_url,
  theme
) VALUES (
  'bf7c8c8e-4b5f-4e6a-9c8d-1a2b3c4d5e6f',
  'Lea Aesthetics Academy',
  'lea-aesthetics-academy',
  'clinic',
  'Europe/London',
  '{"street": "123 Luxury Lane", "city": "London", "postcode": "SW1A 1AA", "country": "United Kingdom"}',
  '+44 20 7946 0958',
  'info@lea-aesthetics.com',
  'https://lea-aesthetics.com',
  '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"closed": true}
  }',
  '{"booking_buffer": 15, "cancellation_window": 24, "deposit_required": true, "deposit_percentage": 25}',
  ARRAY['WiFi', 'Parking', 'Refreshments', 'Private Rooms', 'Air Conditioning'],
  'https://example.com/logo.png',
  '{
    "primary": "#8B5A3C",
    "secondary": "#F5E6D3",
    "accent": "#C49B7A",
    "neutral": "#2C2C2C",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444"
  }'
) ON CONFLICT (id) DO NOTHING;

-- Insert some services
INSERT INTO public.services (
  id,
  name,
  slug,
  description,
  short_description,
  base_price,
  duration_min,
  category,
  subcategory,
  requirements,
  contraindications,
  aftercare,
  tags,
  display_order,
  is_bookable,
  is_active
) VALUES 
(
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'Anti-Wrinkle Treatment',
  'anti-wrinkle-treatment',
  'Professional anti-wrinkle injections using premium botulinum toxin to smooth fine lines and wrinkles.',
  'Smooth fine lines and wrinkles with premium botulinum toxin',
  35000, -- £350.00 in pence
  45,
  'Injectable Treatments',
  'Anti-Ageing',
  '["Consultation required", "Medical history review", "Patch test if sensitive skin"]',
  '["Pregnancy", "Breastfeeding", "Myasthenia gravis", "Recent facial surgery"]',
  '["Avoid exercise for 24 hours", "No lying down for 4 hours", "Avoid alcohol", "Apply ice if swelling"]',
  ARRAY['botox', 'anti-ageing', 'wrinkles', 'injectable'],
  1,
  true,
  true
),
(
  '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
  'Dermal Fillers',
  'dermal-fillers',
  'Hyaluronic acid dermal fillers to restore volume and enhance facial contours.',
  'Restore volume and enhance facial contours',
  45000, -- £450.00 in pence
  60,
  'Injectable Treatments',
  'Volume Enhancement',
  '["Consultation required", "Medical history review", "Avoid blood thinners"]',
  '["Pregnancy", "Breastfeeding", "Active skin infection", "Autoimmune conditions"]',
  '["Avoid exercise for 24 hours", "Sleep elevated", "Avoid heat treatments", "Gentle skincare only"]',
  ARRAY['fillers', 'volume', 'lips', 'cheeks'],
  2,
  true,
  true
),
(
  '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  'Chemical Peel',
  'chemical-peel',
  'Professional chemical peel treatment to improve skin texture, tone, and appearance.',
  'Improve skin texture and tone with professional peels',
  18000, -- £180.00 in pence
  75,
  'Skin Treatments',
  'Resurfacing',
  '["Skin assessment", "Patch test 48 hours prior", "Discontinue retinoids 1 week before"]',
  '["Active acne", "Open wounds", "Recent sun exposure", "Pregnancy"]',
  '["Avoid sun exposure", "Use SPF 30+", "Gentle cleansing only", "Moisturize frequently"]',
  ARRAY['peel', 'skin-texture', 'pigmentation', 'acne'],
  3,
  true,
  true
);

-- Insert a sample course
INSERT INTO public.courses (
  id,
  title,
  slug,
  description,
  level,
  category,
  duration,
  credits,
  price,
  content,
  cover_image,
  tags,
  passing_score,
  is_published,
  is_active,
  display_order
) VALUES (
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'Foundation in Aesthetic Treatments',
  'foundation-aesthetic-treatments',
  'Comprehensive foundation course covering the basics of aesthetic treatments, anatomy, and safety protocols.',
  'Beginner',
  'Aesthetic Medicine',
  40, -- 40 hours
  4,
  149900, -- £1,499.00 in pence
  '{
    "overview": "This comprehensive foundation course provides students with essential knowledge and skills in aesthetic treatments.",
    "learning_outcomes": [
      "Understand facial anatomy and physiology",
      "Learn safety protocols and contraindications",
      "Perform basic consultation techniques",
      "Understand product knowledge and selection"
    ],
    "assessment_methods": ["Written examination", "Practical assessment", "Case study presentation"]
  }',
  'https://example.com/course-cover.jpg',
  ARRAY['foundation', 'beginner', 'anatomy', 'safety'],
  75,
  true,
  true,
  1
);

-- Insert modules for the course
INSERT INTO public.modules (
  id,
  course_id,
  title,
  slug,
  description,
  content,
  order_num,
  duration,
  is_required
) VALUES 
(
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'Facial Anatomy & Physiology',
  'facial-anatomy-physiology',
  'Comprehensive study of facial anatomy and physiology relevant to aesthetic treatments.',
  '{
    "overview": "Understanding facial anatomy is crucial for safe and effective aesthetic treatments.",
    "topics": [
      "Facial muscle groups",
      "Nerve pathways",
      "Blood supply",
      "Skin layers and structure",
      "Ageing process"
    ]
  }',
  1,
  8,
  true
),
(
  '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'Safety & Contraindications',
  'safety-contraindications',
  'Learn essential safety protocols and contraindications for aesthetic treatments.',
  '{
    "overview": "Safety is paramount in aesthetic practice. This module covers all essential safety considerations.",
    "topics": [
      "Risk assessment",
      "Contraindications",
      "Emergency procedures",
      "Infection control",
      "Documentation requirements"
    ]
  }',
  2,
  6,
  true
);

-- Insert lessons for the first module
INSERT INTO public.lessons (
  id,
  module_id,
  title,
  slug,
  content,
  type,
  order_num,
  duration,
  is_required
) VALUES 
(
  '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  'Introduction to Facial Anatomy',
  'introduction-facial-anatomy',
  '{
    "type": "video",
    "video_url": "https://example.com/video1.mp4",
    "transcript": "Welcome to the introduction to facial anatomy...",
    "slides": ["slide1.pdf", "slide2.pdf"],
    "notes": "Key points to remember about facial anatomy..."
  }',
  'video',
  1,
  45,
  true
),
(
  '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  'Facial Muscle Groups',
  'facial-muscle-groups',
  '{
    "type": "interactive",
    "content": "Interactive diagram of facial muscle groups",
    "exercises": ["muscle-identification", "function-quiz"],
    "resources": ["anatomy-chart.pdf", "muscle-reference.pdf"]
  }',
  'interactive',
  2,
  60,
  true
);

-- Insert an assessment
INSERT INTO public.assessments (
  id,
  module_id,
  course_id,
  title,
  description,
  type,
  questions,
  passing_score,
  time_limit,
  max_attempts,
  is_required,
  order_num
) VALUES (
  '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  'Anatomy Knowledge Check',
  'Test your understanding of facial anatomy and physiology.',
  'multiple_choice',
  '{
    "questions": [
      {
        "id": 1,
        "question": "Which muscle is responsible for raising the eyebrows?",
        "options": ["Frontalis", "Corrugator", "Procerus", "Temporalis"],
        "correct_answer": 0,
        "explanation": "The frontalis muscle is responsible for raising the eyebrows and creating horizontal forehead lines."
      },
      {
        "id": 2,
        "question": "What is the deepest layer of the skin?",
        "options": ["Epidermis", "Dermis", "Hypodermis", "Stratum corneum"],
        "correct_answer": 2,
        "explanation": "The hypodermis (subcutaneous layer) is the deepest layer of the skin."
      }
    ]
  }',
  80,
  30, -- 30 minutes
  3,
  true,
  1
);
