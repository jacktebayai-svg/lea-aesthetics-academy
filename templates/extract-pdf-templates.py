#!/usr/bin/env python3
"""
PDF Template Extractor for Lea's Aesthetics Clinical Academy

This script extracts text from PDF template collections and automatically
splits them into individual template files based on common patterns.
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import pypdf

class TemplateExtractor:
    def __init__(self, templates_dir: str):
        self.templates_dir = Path(templates_dir)
        self.output_dir = self.templates_dir / "extracted"
        self.output_dir.mkdir(exist_ok=True)
        
        # Common template separators and patterns
        self.template_patterns = [
            # Headers that indicate new templates
            r'^(?:TEMPLATE|FORM|DOCUMENT)?\s*[\d\.\)]*\s*[-:]?\s*([A-Z][A-Z\s&,()-]+)(?:\s*TEMPLATE|\s*FORM)?$',
            # Numbered sections
            r'^\d+[\.\)]\s*([A-Z][A-Z\s&,()-]+?)(?:\s*TEMPLATE|\s*FORM)?$',
            # Bold/caps headers
            r'^([A-Z][A-Z\s&,()-]{10,})$',
            # Template titles with common prefixes
            r'^(?:TEMPLATE|FORM):\s*(.+)$',
        ]
        
        # Template type mapping based on keywords
        self.template_types = {
            'consent': ['consent', 'agreement', 'authorization'],
            'consultation': ['consultation', 'assessment', 'evaluation', 'intake'],
            'treatment_record': ['treatment', 'record', 'notes', 'session'],
            'medical_history': ['medical', 'history', 'health'],
            'aftercare': ['aftercare', 'post-treatment', 'care instructions'],
            'policy': ['policy', 'terms', 'conditions', 'privacy'],
            'waiver': ['waiver', 'liability', 'release'],
            'checklist': ['checklist', 'preparation', 'steps'],
            'lesson_plan': ['lesson', 'curriculum', 'course', 'module'],
            'assessment': ['assessment', 'examination', 'quiz', 'test'],
            'rubric': ['rubric', 'grading', 'marking', 'evaluation'],
            'certificate': ['certificate', 'diploma', 'award'],
            'pricing': ['pricing', 'price', 'cost', 'fee'],
            'risk_assessment': ['risk', 'safety', 'hazard'],
        }

    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """Extract all text from a PDF file."""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
            return ""

    def detect_template_type(self, title: str, content: str) -> str:
        """Detect template type based on title and content keywords."""
        title_lower = title.lower()
        content_lower = content.lower()
        
        for template_type, keywords in self.template_types.items():
            for keyword in keywords:
                if keyword in title_lower or keyword in content_lower:
                    return template_type
        
        return 'document'  # Default type

    def clean_title(self, title: str) -> str:
        """Clean and normalize template title."""
        # Remove common prefixes/suffixes
        title = re.sub(r'^(?:TEMPLATE|FORM|DOCUMENT)[\s\d\.\):-]*', '', title, flags=re.IGNORECASE)
        title = re.sub(r'(?:TEMPLATE|FORM|DOCUMENT)$', '', title, flags=re.IGNORECASE)
        
        # Clean up whitespace and special characters
        title = re.sub(r'\s+', ' ', title).strip()
        title = title.title()
        
        # Handle common abbreviations
        title = re.sub(r'\bGdpr\b', 'GDPR', title)
        title = re.sub(r'\bUk\b', 'UK', title)
        title = re.sub(r'\bDiy\b', 'DIY', title)
        
        return title

    def create_slug(self, title: str) -> str:
        """Create URL-friendly slug from title."""
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')

    def split_into_templates(self, text: str) -> List[Dict[str, str]]:
        """Split extracted text into individual templates."""
        templates = []
        lines = text.split('\n')
        current_template = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_content:
                    current_content.append('')
                continue
            
            # Check if this line looks like a template header
            is_header = False
            title = None
            
            for pattern in self.template_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    title = match.group(1).strip()
                    # Filter out very short or generic titles
                    if len(title) > 5 and not re.match(r'^(page|\d+|section|part)$', title, re.IGNORECASE):
                        is_header = True
                        break
            
            if is_header and title:
                # Save previous template if exists
                if current_template and current_content:
                    current_template['content'] = '\n'.join(current_content).strip()
                    if len(current_template['content']) > 100:  # Only save substantial templates
                        templates.append(current_template)
                
                # Start new template
                clean_title = self.clean_title(title)
                current_template = {
                    'title': clean_title,
                    'slug': self.create_slug(clean_title),
                    'raw_title': title,
                }
                current_content = []
            else:
                # Add to current template content
                if current_template:
                    current_content.append(line)
        
        # Don't forget the last template
        if current_template and current_content:
            current_template['content'] = '\n'.join(current_content).strip()
            if len(current_template['content']) > 100:
                templates.append(current_template)
        
        return templates

    def save_template_files(self, templates: List[Dict[str, str]], source_pdf: str):
        """Save individual template files."""
        pdf_name = Path(source_pdf).stem
        pdf_dir = self.output_dir / pdf_name.replace(' ', '_').lower()
        pdf_dir.mkdir(exist_ok=True)
        
        summary_file = pdf_dir / "templates_summary.md"
        
        with open(summary_file, 'w', encoding='utf-8') as summary:
            summary.write(f"# Templates extracted from {source_pdf}\n\n")
            summary.write(f"Total templates found: {len(templates)}\n\n")
            
            for i, template in enumerate(templates, 1):
                # Detect template type
                template_type = self.detect_template_type(template['title'], template['content'])
                
                # Create individual template file
                filename = f"{i:02d}_{template['slug']}.md"
                filepath = pdf_dir / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(f"# {template['title']}\n\n")
                    f.write(f"**Type:** {template_type}\n")
                    f.write(f"**Slug:** {template['slug']}\n")
                    f.write(f"**Source:** {source_pdf}\n\n")
                    f.write("---\n\n")
                    f.write(template['content'])
                
                # Add to summary
                summary.write(f"## {i}. {template['title']}\n")
                summary.write(f"- **File:** `{filename}`\n")
                summary.write(f"- **Type:** {template_type}\n")
                summary.write(f"- **Slug:** {template['slug']}\n")
                summary.write(f"- **Length:** {len(template['content'])} characters\n\n")
                
                print(f"✓ Extracted: {template['title']} -> {filename}")
        
        print(f"📄 Summary saved to: {summary_file}")
        return len(templates)

    def process_pdf_files(self):
        """Process all PDF files in the templates directory."""
        pdf_files = list(self.templates_dir.glob("*.pdf"))
        
        if not pdf_files:
            print("No PDF files found in templates directory")
            return
        
        total_templates = 0
        
        for pdf_file in pdf_files:
            print(f"\n🔍 Processing: {pdf_file.name}")
            
            # Extract text
            text = self.extract_text_from_pdf(pdf_file)
            if not text.strip():
                print(f"❌ No text extracted from {pdf_file.name}")
                continue
            
            print(f"📝 Extracted {len(text)} characters of text")
            
            # Split into templates
            templates = self.split_into_templates(text)
            print(f"🎯 Found {len(templates)} potential templates")
            
            if templates:
                # Save template files
                count = self.save_template_files(templates, pdf_file.name)
                total_templates += count
            else:
                print(f"⚠️  No templates could be extracted from {pdf_file.name}")
        
        print(f"\n✅ Extraction complete! Total templates extracted: {total_templates}")
        print(f"📁 Output directory: {self.output_dir}")

def main():
    if len(sys.argv) > 1:
        templates_dir = sys.argv[1]
    else:
        templates_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"🚀 Starting PDF template extraction from: {templates_dir}")
    
    extractor = TemplateExtractor(templates_dir)
    extractor.process_pdf_files()

if __name__ == "__main__":
    main()
