import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'tenant_laca';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Updated function to import from extracted PDF templates
async function importExtractedTemplate(filePath: string, sourceInfo: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Extract metadata from the template file
  let title = '';
  let type = 'document';
  let slug = '';
  let source = sourceInfo;
  let contentStart = 0;
  
  // Parse metadata from the template file
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
    } else if (line.startsWith('**Type:**')) {
      type = line.replace(/^\*\*Type:\*\*\s+/, '').trim();
    } else if (line.startsWith('**Slug:**')) {
      slug = line.replace(/^\*\*Slug:\*\*\s+/, '').trim();
    } else if (line.startsWith('**Source:**')) {
      source = line.replace(/^\*\*Source:\*\*\s+/, '').trim();
    } else if (line === '---') {
      contentStart = i + 1;
      break;
    }
  }
  
  // Extract content (everything after the metadata separator)
  const templateContent = lines.slice(contentStart).join('\n').trim();
  
  if (!title || !templateContent || templateContent.length < 50) {
    console.log(`⚠️  Skipping ${filePath} - insufficient content or metadata`);
    return;
  }
  
  // Generate slug if not provided
  if (!slug) {
    slug = slugify(title);
  }
  
  // Extract variables from template content (anything in {{variable}} format)
  const variableMatches = templateContent.match(/\{\{([^}]+)\}\}/g) || [];
  const variables = variableMatches.map(match => 
    match.replace(/[{}]/g, '').trim()
  ).filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
  
  try {
    await prisma.template.upsert({
      where: { id: `${DEFAULT_TENANT_ID}:${slug}` },
      update: {
        name: title,
        content: templateContent,
        type: type as any,
        variables,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        id: `${DEFAULT_TENANT_ID}:${slug}`,
        tenantId: DEFAULT_TENANT_ID,
        name: title,
        slug,
        type: type as any,
        content: templateContent,
        variables,
        jurisdiction: 'UK', // Default to UK for Lea's Academy
        version: '1.0.0', // Default version
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Imported: ${title} (${type})`);
  } catch (error) {
    console.error(`❌ Failed to import ${title}:`, error);
  }
}

// Legacy function for importing from markdown files with ### headers
async function importFromFile(filePath: string, typeHint?: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  // Simple parser: split at level-3 headings (### ) to create individual templates
  let currentTitle: string | null = null;
  let currentBuffer: string[] = [];
  const sections: { title: string; body: string }[] = [];

  const flush = () => {
    if (currentTitle && currentBuffer.length) {
      sections.push({ title: currentTitle, body: currentBuffer.join('\n').trim() });
    }
    currentTitle = null;
    currentBuffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flush();
      currentTitle = line.replace(/^###\s+/, '').trim();
    } else {
      if (currentTitle) currentBuffer.push(line);
    }
  }
  flush();

  for (const sec of sections) {
    const name = sec.title;
    const slug = slugify(name);
    // crude type mapping based on keywords
    const lower = name.toLowerCase();
    let t = typeHint || 'document';
    if (lower.includes('consent')) t = 'consent';
    else if (lower.includes('consultation')) t = 'consultation';
    else if (lower.includes('treatment record')) t = 'treatment_record';
    else if (lower.includes('lesson plan')) t = 'lesson_plan';
    else if (lower.includes('assessment')) t = 'assessment';
    else if (lower.includes('portfolio')) t = 'rubric';
    else if (lower.includes('pricing')) t = 'pricing';
    else if (lower.includes('terms')) t = 'policy';
    else if (lower.includes('risk')) t = 'risk_assessment';
    else if (lower.includes('checklist')) t = 'checklist';

    await prisma.template.upsert({
      where: { id: `${DEFAULT_TENANT_ID}:${slug}` },
      update: {
        name,
        content: sec.body,
        type: t as any,
        isActive: true,
      },
      create: {
        id: `${DEFAULT_TENANT_ID}:${slug}`,
        tenantId: DEFAULT_TENANT_ID,
        name,
        slug,
        type: t as any,
        content: sec.body,
        variables: [],
        jurisdiction: 'UK', // Default to UK for Lea's Academy
        version: '1.0.0', // Default version
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

// Function to recursively find and import all extracted template files
async function importExtractedTemplates(extractedDir: string) {
  if (!fs.existsSync(extractedDir)) {
    console.log(`⚠️  Extracted templates directory not found: ${extractedDir}`);
    return;
  }
  
  const subdirs = fs.readdirSync(extractedDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  let totalImported = 0;
  
  for (const subdir of subdirs) {
    const subdirPath = path.join(extractedDir, subdir);
    console.log(`\n📁 Processing directory: ${subdir}`);
    
    const files = fs.readdirSync(subdirPath)
      .filter(file => file.endsWith('.md') && !file.includes('summary'))
      .sort();
    
    for (const file of files) {
      const filePath = path.join(subdirPath, file);
      await importExtractedTemplate(filePath, subdir);
      totalImported++;
    }
  }
  
  console.log(`\n📊 Total templates imported: ${totalImported}`);
}

async function main() {
  console.log('📄 Importing templates...');
  const templatesRoot = '/home/yelovelo/Desktop/lea-aesthetics-academy/templates';
  
  // Import from extracted PDF templates first (priority)
  const extractedDir = path.join(templatesRoot, 'extracted');
  await importExtractedTemplates(extractedDir);
  
  // Import legacy markdown files if they exist
  const legacyFiles = [
    'aesthetician_professional_templates.md',
    'aesthetics_tutor_templates.md'
  ];
  
  for (const filename of legacyFiles) {
    const filePath = path.join(templatesRoot, filename);
    if (fs.existsSync(filePath)) {
      console.log(`\n📝 Importing legacy file: ${filename}`);
      await importFromFile(filePath);
    }
  }
  
  console.log('✅ All templates imported successfully!');
}

main().catch((e) => {
  console.error('Template import failed', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
