'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@leas-academy/ui/components/card';
import { Button } from '@leas-academy/ui/components/button';
import { Input } from '@leas-academy/ui/components/input';
import { Badge } from '@leas-academy/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@leas-academy/ui/components/tabs';
import { 
  Send, 
  FileText, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Edit,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  jurisdiction: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  variables: string[];
}

interface Course {
  id: string;
  title: string;
  level: string;
  status: 'draft' | 'published' | 'archived';
  enrollments: number;
  modules: number;
  createdAt: string;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: FileText },
  { id: 'consent', name: 'Consent Forms', icon: CheckCircle },
  { id: 'consultation', name: 'Consultation Forms', icon: Users },
  { id: 'medical_history', name: 'Medical History', icon: AlertCircle },
  { id: 'treatment_record', name: 'Treatment Records', icon: FileText },
  { id: 'policy', name: 'Policies & Terms', icon: FileText },
  { id: 'lesson_plan', name: 'Lesson Plans', icon: GraduationCap },
  { id: 'assessment', name: 'Assessments', icon: CheckCircle },
  { id: 'certificate', name: 'Certificates', icon: GraduationCap },
  { id: 'checklist', name: 'Checklists', icon: CheckCircle },
  { id: 'rubric', name: 'Rubrics', icon: CheckCircle }
];

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch templates
        const templatesResponse = await fetch('/api/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          // Transform API data to match UI interface
          const transformedTemplates = templatesData.map((template: any) => ({
            ...template,
            category: template.type, // Map type to category for filtering
            variables: template.placeholders || [],
            createdAt: template.createdAt || new Date().toISOString(),
          }));
          setTemplates(transformedTemplates);
        }
        
        // Fetch courses
        const coursesResponse = await fetch('/api/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          // Transform API data to match UI interface
          const transformedCourses = coursesData.map((course: any) => ({
            ...course,
            status: course.isPublished ? 'published' : 'draft',
            enrollments: course.enrollments?.length || 0,
            modules: course.modules?.length || 0,
            createdAt: course.createdAt || new Date().toISOString(),
          }));
          setCourses(transformedCourses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays on error
        setTemplates([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendToClients = () => {
    if (selectedTemplates.length === 0) return;
    router.push(`/admin/templates/send?type=client&templates=${selectedTemplates.join(',')}`);
  };

  const handleSendToStudents = () => {
    if (selectedTemplates.length === 0) return;
    router.push(`/admin/templates/send?type=student&templates=${selectedTemplates.join(',')}`);
  };

  const handleSendCourse = (courseId: string) => {
    router.push(`/admin/courses/send?courseId=${courseId}`);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = TEMPLATE_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.icon || FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-noir-900">Template & Course Management</h1>
          <p className="text-platinum-600 mt-1">
            Manage templates and courses for clients and students
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSendToClients}
            disabled={selectedTemplates.length === 0}
            className="bg-champagne-gold hover:bg-champagne-gold/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Clients ({selectedTemplates.length})
          </Button>
          <Button 
            onClick={handleSendToStudents}
            disabled={selectedTemplates.length === 0}
            variant="outline"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Send to Students ({selectedTemplates.length})
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-platinum-400 w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {TEMPLATE_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="whitespace-nowrap"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-platinum-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-platinum-200 rounded w-32"></div>
                        <div className="h-3 bg-platinum-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-platinum-200 rounded"></div>
                      <div className="h-3 bg-platinum-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const Icon = getCategoryIcon(template.category);
              return (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplates.includes(template.id) 
                      ? 'ring-2 ring-champagne-gold bg-champagne-gold/5' 
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedTemplates(prev => 
                      prev.includes(template.id)
                        ? prev.filter(id => id !== template.id)
                        : [...prev, template.id]
                    );
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-platinum-100">
                          <Icon className="w-5 h-5 text-champagne-gold" />
                        </div>
                        <div>
                          <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{template.version}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-platinum-600">
                        <span>Variables: {template.variables.length}</span>
                        <span>{template.jurisdiction}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-platinum-500">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-noir-900">Course Management</h2>
              <p className="text-platinum-600 text-sm">
                Send courses to students and manage course delivery
              </p>
            </div>
            <Button className="bg-champagne-gold hover:bg-champagne-gold/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-platinum-100">
                      <GraduationCap className="w-6 h-6 text-champagne-gold" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-platinum-400" />
                      <span>{course.enrollments} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-platinum-400" />
                      <span>{course.modules} modules</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock className="w-4 h-4 text-platinum-400" />
                      <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSendCourse(course.id)}
                      className="flex-1 bg-champagne-gold hover:bg-champagne-gold/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Students
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
