'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/components/Card';
import { Button } from '@/lib/ui/components/Button';
import { Input } from '@/lib/ui/components/Input';
import { Badge } from '@/lib/ui/components/Badge';
import { Select } from '@/lib/ui/components/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/ui/components/Tabs';
import { Checkbox } from '@/lib/ui/components/Checkbox';
import { 
  Send, 
  FileText, 
  Users, 
  GraduationCap, 
  ArrowLeft,
  Mail,
  Printer,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  version: string;
  variables: string[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'student';
  status: 'active' | 'inactive';
  lastActivity?: string;
}

function SendTemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientType = searchParams.get('type') as 'client' | 'student';
  const templateIds = searchParams.get('templates')?.split(',') || [];

  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'portal' | 'print'>('portal');
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requireSignature, setRequireSignature] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'Comprehensive Patient Consultation',
        type: 'consultation',
        category: 'consultation',
        version: '1.0.0',
        variables: ['patient_name', 'date', 'practitioner_name']
      },
      {
        id: '2',
        name: 'Botox Treatment Consent',
        type: 'consent',
        category: 'consent',
        version: '1.0.0',
        variables: ['patient_name', 'treatment_date', 'risks']
      },
      {
        id: '3',
        name: 'Course Syllabus Template',
        type: 'lesson_plan',
        category: 'lesson_plan',
        version: '1.0.0',
        variables: ['course_title', 'level', 'duration']
      }
    ];

    const mockClients: Recipient[] = [
      {
        id: '1',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        type: 'client',
        status: 'active',
        lastActivity: '2024-01-15'
      },
      {
        id: '2',
        name: 'James Thompson',
        email: 'james.thompson@email.com',
        type: 'client',
        status: 'active',
        lastActivity: '2024-01-14'
      },
      {
        id: '3',
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        type: 'client',
        status: 'inactive',
        lastActivity: '2024-01-10'
      }
    ];

    const mockStudents: Recipient[] = [
      {
        id: '1',
        name: 'Alex Taylor',
        email: 'alex.taylor@email.com',
        type: 'student',
        status: 'active',
        lastActivity: '2024-01-15'
      },
      {
        id: '2',
        name: 'Morgan Lee',
        email: 'morgan.lee@email.com',
        type: 'student',
        status: 'active',
        lastActivity: '2024-01-14'
      },
      {
        id: '3',
        name: 'Jordan Smith',
        email: 'jordan.smith@email.com',
        type: 'student',
        status: 'active',
        lastActivity: '2024-01-13'
      }
    ];

    setTemplates(mockTemplates.filter(t => templateIds.includes(t.id)));
    setRecipients(recipientType === 'client' ? mockClients : mockStudents);
  }, [templateIds, recipientType]);

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (selectedRecipients.length === 0) return;
    
    setSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSending(false);
    router.push('/admin/templates?sent=true');
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email':
        return Mail;
      case 'portal':
        return Eye;
      case 'print':
        return Printer;
      default:
        return Send;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-400';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-noir-900">
            Send Templates to {recipientType === 'client' ? 'Clients' : 'Students'}
          </h1>
          <p className="text-platinum-600 mt-1">
            Configure delivery settings and select recipients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Selected Templates ({templates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
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
                  <div className="mt-2 text-xs text-platinum-600">
                    Variables: {template.variables.join(', ')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Settings & Recipients */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-noir-700 mb-2 block">
                    Delivery Method
                  </label>
                  <Select value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portal">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Portal Access
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email PDF
                        </div>
                      </SelectItem>
                      <SelectItem value="print">
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Print Ready
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-noir-700 mb-2 block">
                    Deadline (Optional)
                  </label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-noir-700 mb-2 block">
                  Message to Recipients
                </label>
                <Textarea
                  placeholder="Add a personalized message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="signature"
                  checked={requireSignature}
                  onCheckedChange={(checked) => setRequireSignature(checked as boolean)}
                />
                <label
                  htmlFor="signature"
                  className="text-sm font-medium text-noir-700 cursor-pointer"
                >
                  Require digital signature
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Recipients Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {recipientType === 'client' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                  Select Recipients ({selectedRecipients.length} selected)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedRecipients.length === filteredRecipients.length) {
                      setSelectedRecipients([]);
                    } else {
                      setSelectedRecipients(filteredRecipients.map(r => r.id));
                    }
                  }}
                >
                  {selectedRecipients.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder={`Search ${recipientType}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredRecipients.map((recipient) => {
                  const StatusIcon = getStatusIcon(recipient.status);
                  return (
                    <div
                      key={recipient.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedRecipients.includes(recipient.id)
                          ? 'ring-2 ring-champagne-gold bg-champagne-gold/5'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedRecipients(prev =>
                          prev.includes(recipient.id)
                            ? prev.filter(id => id !== recipient.id)
                            : [...prev, recipient.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRecipients.includes(recipient.id)}
                          />
                          <div>
                            <h4 className="font-medium text-sm">{recipient.name}</h4>
                            <p className="text-xs text-platinum-600">{recipient.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(recipient.status)}`} />
                        </div>
                      </div>
                      {recipient.lastActivity && (
                        <div className="mt-2 text-xs text-platinum-500">
                          Last active: {new Date(recipient.lastActivity).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Send Action */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-noir-900">Ready to Send</h3>
                  <p className="text-sm text-platinum-600">
                    {templates.length} template(s) to {selectedRecipients.length} recipient(s)
                  </p>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={selectedRecipients.length === 0 || sending}
                  className="bg-champagne-gold hover:bg-champagne-gold/90"
                >
                  {sending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Templates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SendTemplatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendTemplatesContent />
    </Suspense>
  );
}
