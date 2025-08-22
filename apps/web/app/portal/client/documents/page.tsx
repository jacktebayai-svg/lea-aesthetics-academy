'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '../../../../components/portal/ClientLayout';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';

interface Document {
  id: string;
  type: 'consultation_form' | 'receipt' | 'treatment_plan' | 'aftercare' | 'consent_form' | 'certificate';
  title: string;
  description?: string;
  file_url?: string;
  metadata?: {
    appointment_id?: string;
    service_name?: string;
    date_generated?: string;
    file_size?: number;
    file_type?: string;
  };
  created_at: string;
  status: 'pending' | 'completed' | 'signed' | 'archived';
}

type FilterType = 'all' | 'consultation_form' | 'receipt' | 'treatment_plan' | 'aftercare' | 'consent_form' | 'certificate';

export default function DocumentsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filterType, searchQuery]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // For now, we'll create mock documents since the documents table might not exist yet
      // In a real implementation, this would fetch from a documents table
      const mockDocuments: Document[] = [
        {
          id: '1',
          type: 'consultation_form',
          title: 'Initial Consultation Form',
          description: 'Pre-treatment consultation and medical history',
          metadata: {
            appointment_id: 'apt_001',
            service_name: 'Facial Consultation',
            date_generated: '2024-01-15T10:00:00Z',
            file_size: 245760,
            file_type: 'pdf'
          },
          created_at: '2024-01-15T10:00:00Z',
          status: 'completed'
        },
        {
          id: '2',
          type: 'receipt',
          title: 'Treatment Receipt - Hydrafacial',
          description: 'Payment receipt for HydraFacial treatment',
          metadata: {
            appointment_id: 'apt_002',
            service_name: 'HydraFacial',
            date_generated: '2024-01-20T14:30:00Z',
            file_size: 89120,
            file_type: 'pdf'
          },
          created_at: '2024-01-20T14:30:00Z',
          status: 'completed'
        },
        {
          id: '3',
          type: 'treatment_plan',
          title: 'Acne Treatment Plan',
          description: 'Customized treatment plan for acne management',
          metadata: {
            service_name: 'Acne Treatment Program',
            date_generated: '2024-01-22T11:15:00Z',
            file_size: 156830,
            file_type: 'pdf'
          },
          created_at: '2024-01-22T11:15:00Z',
          status: 'completed'
        },
        {
          id: '4',
          type: 'aftercare',
          title: 'Post-Treatment Care Instructions',
          description: 'Aftercare guidelines following chemical peel',
          metadata: {
            appointment_id: 'apt_003',
            service_name: 'Chemical Peel',
            date_generated: '2024-02-01T16:00:00Z',
            file_size: 67440,
            file_type: 'pdf'
          },
          created_at: '2024-02-01T16:00:00Z',
          status: 'completed'
        },
        {
          id: '5',
          type: 'consent_form',
          title: 'Botox Treatment Consent',
          description: 'Informed consent form for Botox treatment',
          metadata: {
            appointment_id: 'apt_004',
            service_name: 'Botox Treatment',
            date_generated: '2024-02-10T09:00:00Z',
            file_size: 198720,
            file_type: 'pdf'
          },
          created_at: '2024-02-10T09:00:00Z',
          status: 'pending'
        }
      ];

      setDocuments(mockDocuments);

    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.metadata?.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());

    setFilteredDocuments(filtered);
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'consultation_form': return '📋';
      case 'receipt': return '🧾';
      case 'treatment_plan': return '📊';
      case 'aftercare': return '💊';
      case 'consent_form': return '📝';
      case 'certificate': return '🏆';
      default: return '📄';
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'consultation_form': return 'Consultation Form';
      case 'receipt': return 'Receipt';
      case 'treatment_plan': return 'Treatment Plan';
      case 'aftercare': return 'Aftercare Instructions';
      case 'consent_form': return 'Consent Form';
      case 'certificate': return 'Certificate';
      default: return 'Document';
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <ClientLayout title="My Documents">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout title="My Documents">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="My Documents">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-elegant p-8 text-white">
          <h2 className="text-3xl font-elegant font-semibold mb-2">
            Document Center
          </h2>
          <p className="text-purple-100">
            Access your consultation forms, receipts, treatment plans, and more
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search documents
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Document Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All documents</option>
                <option value="consultation_form">Consultation Forms</option>
                <option value="receipt">Receipts</option>
                <option value="treatment_plan">Treatment Plans</option>
                <option value="aftercare">Aftercare Instructions</option>
                <option value="consent_form">Consent Forms</option>
                <option value="certificate">Certificates</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'consultation_form', label: 'Forms', icon: '📋', count: documents.filter(d => d.type === 'consultation_form').length },
            { type: 'receipt', label: 'Receipts', icon: '🧾', count: documents.filter(d => d.type === 'receipt').length },
            { type: 'treatment_plan', label: 'Plans', icon: '📊', count: documents.filter(d => d.type === 'treatment_plan').length },
            { type: 'aftercare', label: 'Aftercare', icon: '💊', count: documents.filter(d => d.type === 'aftercare').length },
            { type: 'consent_form', label: 'Consent', icon: '📝', count: documents.filter(d => d.type === 'consent_form').length },
            { type: 'certificate', label: 'Certificates', icon: '🏆', count: documents.filter(d => d.type === 'certificate').length }
          ].map((category) => (
            <button
              key={category.type}
              onClick={() => setFilterType(category.type as FilterType)}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                filterType === category.type
                  ? 'bg-purple-50 border-purple-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="font-medium text-gray-900 text-sm">{category.label}</div>
              <div className="text-xs text-gray-500">{category.count}</div>
            </button>
          ))}
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white rounded-2xl shadow-elegant p-6">
                <div className="flex items-start justify-between">
                  {/* Document Info */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getDocumentIcon(document.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {document.title}
                          </h3>
                          {document.description && (
                            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${getStatusColor(document.status)}`}>
                          {document.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Type:</span> {getDocumentTypeLabel(document.type)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {format(parseISO(document.created_at), 'MMM dd, yyyy')}
                        </div>
                        {document.metadata?.service_name && (
                          <div>
                            <span className="font-medium">Service:</span> {document.metadata.service_name}
                          </div>
                        )}
                        {document.metadata?.file_size && (
                          <div>
                            <span className="font-medium">Size:</span> {formatFileSize(document.metadata.file_size)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 ml-4">
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      View
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Download
                    </button>
                    {document.status === 'pending' && document.type === 'consent_form' && (
                      <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                        Sign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your documents will appear here after your appointments and treatments'
                }
              </p>
              {(!searchQuery && filterType === 'all') && (
                <button 
                  onClick={() => router.push('/clinic')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {filteredDocuments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-elegant p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-medium text-gray-900">Download All</div>
                <div className="text-sm text-gray-600">Get all documents as ZIP</div>
              </button>
              <button className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-medium text-gray-900">Email Documents</div>
                <div className="text-sm text-gray-600">Send to your email</div>
              </button>
              <button className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium text-gray-900">Request Document</div>
                <div className="text-sm text-gray-600">Ask for specific forms</div>
              </button>
              <button className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
                <div className="text-2xl mb-2">❓</div>
                <div className="font-medium text-gray-900">Help</div>
                <div className="text-sm text-gray-600">Document assistance</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
