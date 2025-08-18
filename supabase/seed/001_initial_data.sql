-- Master Aesthetics Suite - Initial Seed Data
-- Sample data for development and testing

-- Insert business settings (single-tenant configuration)
INSERT INTO business_settings (
  id,
  business_name,
  owner_name,
  email,
  phone,
  address,
  timezone,
  branding,
  policies
) VALUES (
  'business_settings',
  'Lea''s Aesthetics Clinical Academy',
  'Lea',
  'lea@leaaesthetics.com',
  '+44 7123 456789',
  '{
    "street": "123 Harley Street",
    "city": "London",
    "postal_code": "W1G 6BA",
    "country": "United Kingdom"
  }',
  'Europe/London',
  '{
    "primary_color": "#1A1A1A",
    "secondary_color": "#C5A880",
    "accent_color": "#FFFFFF",
    "logo_url": "",
    "theme": "luxury"
  }',
  '{
    "cancellation_hours": 24,
    "deposit_percentage": 25,
    "refund_policy": "Deposits are refundable up to 48 hours before appointment",
    "terms_url": "/terms",
    "privacy_url": "/privacy"
  }'
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  owner_name = EXCLUDED.owner_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  branding = EXCLUDED.branding,
  policies = EXCLUDED.policies,
  updated_at = NOW();

-- Insert sample services
INSERT INTO services (name, slug, description, base_price, duration_minutes, category, buffer_minutes, settings) VALUES
-- Treatment Services
('Anti-Wrinkle Injections', 'anti-wrinkle-injections', 'Professional botulinum toxin treatment to reduce fine lines and wrinkles', 20000, 45, 'treatment', '{"before": 15, "after": 15}', '{"requires_consultation": true, "min_age": 18}'),
('Dermal Fillers', 'dermal-fillers', 'Hyaluronic acid fillers for volume restoration and enhancement', 35000, 60, 'treatment', '{"before": 15, "after": 30}', '{"requires_consultation": true, "min_age": 18}'),
('Skin Consultation', 'skin-consultation', 'Comprehensive skin analysis and treatment planning', 8000, 30, 'consultation', '{"before": 10, "after": 10}', '{"includes_photos": true}'),
('Chemical Peel', 'chemical-peel', 'Professional chemical peel treatment for skin renewal', 15000, 45, 'treatment', '{"before": 15, "after": 15}', '{"aftercare_required": true}'),
('Microneedling', 'microneedling', 'Collagen induction therapy for skin rejuvenation', 18000, 60, 'treatment', '{"before": 15, "after": 15}', '{"numbing_cream": true}'),

-- Course Services
('Level 2 Anatomy & Physiology', 'level-2-anatomy-physiology', 'Foundation course in anatomy and physiology for aesthetic practitioners', 29900, 480, 'course', '{}', '{"certification": "Level 2 A&P Certificate", "prerequisites": []}'),
('Level 3 Aesthetic Treatments', 'level-3-aesthetic-treatments', 'Advanced training in non-surgical aesthetic procedures', 59900, 960, 'course', '{}', '{"certification": "Level 3 Aesthetics Certificate", "prerequisites": ["level-2-anatomy-physiology"]}'),
('Botulinum Toxin Training', 'botulinum-toxin-training', 'Comprehensive training in botulinum toxin administration', 89900, 720, 'course', '{}', '{"certification": "Botox Certificate", "prerequisites": ["level-3-aesthetic-treatments"]}'),
('Dermal Filler Training', 'dermal-filler-training', 'Complete dermal filler injection techniques and safety', 89900, 720, 'course', '{}', '{"certification": "Dermal Filler Certificate", "prerequisites": ["level-3-aesthetic-treatments"]}'),
('CPR & Anaphylaxis', 'cpr-anaphylaxis', 'Essential emergency response training for aesthetic practitioners', 19900, 240, 'course', '{}', '{"certification": "CPR & Anaphylaxis Certificate", "renewal_required": true}')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  duration_minutes = EXCLUDED.duration_minutes,
  category = EXCLUDED.category,
  buffer_minutes = EXCLUDED.buffer_minutes,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Insert courses
INSERT INTO courses (title, slug, description, price, duration_hours, max_students, curriculum, prerequisites, certificate_template) VALUES
('Level 2 Anatomy & Physiology', 'level-2-anatomy-physiology', 'Comprehensive foundation course covering human anatomy and physiology specifically for aesthetic practitioners. This course provides essential knowledge of skin structure, muscle anatomy, and physiological processes relevant to aesthetic treatments.', 29900, 8, 12, 
'{
  "modules": [
    {
      "title": "Introduction to Anatomy",
      "lessons": [
        {"title": "Basic Anatomical Terms", "type": "video", "duration": 30},
        {"title": "Body Systems Overview", "type": "reading", "duration": 45},
        {"title": "Assessment Quiz", "type": "quiz", "duration": 15}
      ]
    },
    {
      "title": "Skin Anatomy",
      "lessons": [
        {"title": "Layers of the Skin", "type": "video", "duration": 45},
        {"title": "Skin Functions", "type": "video", "duration": 30},
        {"title": "Aging Process", "type": "reading", "duration": 30},
        {"title": "Practical Assessment", "type": "practical", "duration": 60}
      ]
    },
    {
      "title": "Muscle Anatomy",
      "lessons": [
        {"title": "Facial Muscles", "type": "video", "duration": 60},
        {"title": "Muscle Physiology", "type": "reading", "duration": 30},
        {"title": "Clinical Application", "type": "video", "duration": 45}
      ]
    }
  ]
}', '{}', 
'{
  "template": "level_2_certificate",
  "title": "Level 2 Anatomy & Physiology Certificate",
  "issuer": "Lea''s Aesthetics Clinical Academy",
  "description": "This certifies successful completion of Level 2 Anatomy & Physiology training"
}'),

('Level 3 Aesthetic Treatments', 'level-3-aesthetic-treatments', 'Advanced training program covering non-surgical aesthetic treatments, contraindications, and professional practice standards. Prepares students for advanced aesthetic procedures.', 59900, 16, 8,
'{
  "modules": [
    {
      "title": "Treatment Modalities",
      "lessons": [
        {"title": "Non-Surgical Options", "type": "video", "duration": 45},
        {"title": "Treatment Selection", "type": "video", "duration": 30},
        {"title": "Case Studies", "type": "reading", "duration": 60}
      ]
    },
    {
      "title": "Safety & Contraindications",
      "lessons": [
        {"title": "Risk Assessment", "type": "video", "duration": 60},
        {"title": "Contraindications", "type": "reading", "duration": 45},
        {"title": "Emergency Procedures", "type": "video", "duration": 30}
      ]
    },
    {
      "title": "Professional Practice",
      "lessons": [
        {"title": "Consultation Process", "type": "video", "duration": 45},
        {"title": "Documentation", "type": "reading", "duration": 30},
        {"title": "Legal Requirements", "type": "reading", "duration": 45}
      ]
    }
  ]
}', '{"required_courses": ["level-2-anatomy-physiology"]}',
'{
  "template": "level_3_certificate",
  "title": "Level 3 Aesthetic Treatments Certificate",
  "issuer": "Lea''s Aesthetics Clinical Academy",
  "description": "This certifies successful completion of Level 3 Aesthetic Treatments training"
}'),

('Botulinum Toxin Training', 'botulinum-toxin-training', 'Comprehensive hands-on training in botulinum toxin administration, including practical sessions with live models. Covers injection techniques, dosing, and adverse event management.', 89900, 12, 6,
'{
  "modules": [
    {
      "title": "Botulinum Toxin Fundamentals",
      "lessons": [
        {"title": "Product Knowledge", "type": "video", "duration": 60},
        {"title": "Mechanism of Action", "type": "reading", "duration": 45},
        {"title": "Dosing Guidelines", "type": "video", "duration": 45}
      ]
    },
    {
      "title": "Injection Techniques",
      "lessons": [
        {"title": "Facial Analysis", "type": "video", "duration": 45},
        {"title": "Injection Points", "type": "practical", "duration": 120},
        {"title": "Live Model Practice", "type": "practical", "duration": 180}
      ]
    },
    {
      "title": "Complications Management",
      "lessons": [
        {"title": "Adverse Events", "type": "video", "duration": 45},
        {"title": "Emergency Protocols", "type": "reading", "duration": 30},
        {"title": "Case Management", "type": "video", "duration": 30}
      ]
    }
  ]
}', '{"required_courses": ["level-3-aesthetic-treatments", "cpr-anaphylaxis"]}',
'{
  "template": "botox_certificate",
  "title": "Botulinum Toxin Administration Certificate",
  "issuer": "Lea''s Aesthetics Clinical Academy",
  "description": "This certifies successful completion of Botulinum Toxin training with practical assessment"
}')

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_hours = EXCLUDED.duration_hours,
  max_students = EXCLUDED.max_students,
  curriculum = EXCLUDED.curriculum,
  prerequisites = EXCLUDED.prerequisites,
  certificate_template = EXCLUDED.certificate_template,
  updated_at = NOW();

-- Insert document templates
INSERT INTO templates (type, name, content, version, mandatory_blocks) VALUES
('consent', 'Anti-Wrinkle Treatment Consent', 
'{
  "title": "Anti-Wrinkle Treatment Consent Form",
  "sections": [
    {
      "title": "Treatment Information",
      "content": "I understand that I will be receiving botulinum toxin injections for the reduction of facial wrinkles...",
      "mandatory": true
    },
    {
      "title": "Risks and Complications",
      "content": "I understand the potential risks including but not limited to: bruising, swelling, headache...",
      "mandatory": true
    },
    {
      "title": "Aftercare Instructions",
      "content": "I have been provided with aftercare instructions and understand the importance of following them...",
      "mandatory": true
    },
    {
      "title": "Patient Consent",
      "content": "I consent to the treatment described above and confirm that all my questions have been answered...",
      "mandatory": true
    }
  ],
  "signature_required": true,
  "witness_required": false
}', '1.0', ARRAY['patient_consent', 'risks_and_complications']),

('aftercare', 'Anti-Wrinkle Aftercare Instructions', 
'{
  "title": "Post-Treatment Care Instructions",
  "instructions": [
    "Avoid lying down for 4 hours after treatment",
    "Do not massage or rub the treated area for 24 hours",
    "Avoid strenuous exercise for 24 hours",
    "Results will become visible within 3-14 days",
    "Contact us immediately if you experience any unusual symptoms"
  ],
  "emergency_contact": "{{business_phone}}",
  "follow_up": "2 weeks"
}', '1.0', ARRAY[]),

('certificate', 'Course Completion Certificate', 
'{
  "title": "Certificate of Completion",
  "template": "This is to certify that {{student_name}} has successfully completed the {{course_title}} course at Lea''s Aesthetics Clinical Academy on {{completion_date}}.",
  "design": {
    "background": "luxury",
    "border": "gold",
    "logo": true
  },
  "signatures": [
    {"name": "Lea", "title": "Lead Instructor", "required": true}
  ]
}', '1.0', ARRAY['student_name', 'course_title', 'completion_date'])

ON CONFLICT (name) DO UPDATE SET
  content = EXCLUDED.content,
  version = EXCLUDED.version,
  mandatory_blocks = EXCLUDED.mandatory_blocks,
  updated_at = NOW();

-- Success message
SELECT 'Master Aesthetics Suite seed data inserted successfully!' AS status;

-- Show inserted data counts
SELECT 
  'Services' as category, COUNT(*) as count FROM services
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses  
UNION ALL
SELECT 'Templates', COUNT(*) FROM templates
ORDER BY category;
