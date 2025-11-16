import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, User, Users, Building2, FileCheck } from 'lucide-react';
import apiClient from '../config/axios';

const documentCategories = {
  borrower: {
    title: 'Borrower (Student)',
    icon: User,
    documents: [
      { id: 'pan_card', name: 'PAN Card', mandatory: true },
      { id: 'aadhar_card', name: 'Aadhar Card', mandatory: true },
      { id: 'passport', name: 'Passport', mandatory: true },
      { id: 'admission_letter', name: 'University Admission Letter', mandatory: true },
      { id: 'entrance_score', name: 'Entrance Score Card - GRE/GMAT/TOEFL/IELTS, etc.', mandatory: true },
      { id: 'academic_marksheets', name: 'Academic: 10th, 12th & Degree - All semester Individual Marksheets', mandatory: true },
      { id: 'resume', name: 'Resume', mandatory: true },
      { id: 'references', name: 'Name, Address, Contact and Email ID of 2 References (Friends/Family/Neighbors)', mandatory: true },
      { id: 'salary_slips', name: '3 months Salary slips (If Applicable)', mandatory: false },
      { id: 'bank_statements', name: '6 months Bank Statements (If Applicable)', mandatory: false },
      { id: 'form16_itr', name: 'Form 16 / ITR (If Applicable)', mandatory: false }
    ]
  },
  parents: {
    title: 'Mother & Father (Both Compulsory)',
    icon: Users,
    documents: [
      { id: 'mother_pan', name: 'Mother - PAN Card', mandatory: true, parent: 'mother' },
      { id: 'mother_aadhar', name: 'Mother - Aadhar Card', mandatory: true, parent: 'mother' },
      { id: 'mother_contact', name: 'Mother - Mobile Number & Email ID', mandatory: true, parent: 'mother' },
      { id: 'father_pan', name: 'Father - PAN Card', mandatory: true, parent: 'father' },
      { id: 'father_aadhar', name: 'Father - Aadhar Card', mandatory: true, parent: 'father' },
      { id: 'father_contact', name: 'Father - Mobile Number & Email ID', mandatory: true, parent: 'father' }
    ]
  },
  cosigner: {
    title: 'Co-Signer',
    icon: Users,
    documents: [
      { id: 'cosigner_pan_aadhar', name: 'PAN Card & Aadhar card', mandatory: true },
      { id: 'cosigner_salary_slips', name: 'Latest 3 months salary slips', mandatory: true },
      { id: 'cosigner_bank_statements', name: 'Latest 1 Year Salary Credited Bank Statements', mandatory: true },
      { id: 'cosigner_form16', name: 'Latest 2 Years Form 16', mandatory: true },
      { id: 'cosigner_electricity_bill', name: 'Electricity Bill', mandatory: true },
      { id: 'cosigner_contact', name: 'Mobile Number & Email ID', mandatory: true }
    ]
  },
  cosignerSelfEmployed: {
    title: 'Co-Signer (Self Employed/Business)',
    icon: Building2,
    documents: [
      { id: 'cosigner_se_pan_aadhar', name: 'PAN Card & Aadhar card', mandatory: true },
      { id: 'cosigner_se_itr', name: 'Latest 2 year ITR with Computation income, Profit & Loss and Balance sheet', mandatory: true },
      { id: 'cosigner_se_business_proof', name: 'Business proof (GST, UDHYAM ADHAR, and GUMASTA)', mandatory: true },
      { id: 'cosigner_se_bank_statements', name: 'Latest 1 Year Bank Statement (Income Credited)', mandatory: true },
      { id: 'cosigner_se_electricity_bill', name: 'Electricity Bill', mandatory: true },
      { id: 'cosigner_se_contact', name: 'Mobile Number & Email ID', mandatory: true }
    ]
  },
  cosignerFarmer: {
    title: 'Co-Signer (Farmer/Freelancer/Bluecollar jobs)',
    icon: Building2,
    documents: [
      { id: 'cosigner_f_pan_aadhar', name: 'PAN Card & Aadhar card', mandatory: true },
      { id: 'cosigner_f_income_cert', name: 'Agricultural income certificate/ Income certificate', mandatory: true },
      { id: 'cosigner_f_bank_statements', name: '6 Months bank statement', mandatory: true },
      { id: 'cosigner_f_electricity_bill', name: 'Electricity Bill', mandatory: true }
    ]
  },
  collateral: {
    title: 'Collateral Loan',
    icon: FileCheck,
    documents: [
      { id: 'collateral_sale_agreement', name: 'Registered Sale Agreement (All chains)', mandatory: true },
      { id: 'collateral_share_certificate', name: 'Share Certificate', mandatory: true },
      { id: 'collateral_property_docs', name: 'All Property Related Documents- e.g- Sanction Plan, Tax paid Receipt', mandatory: true },
      { id: 'collateral_na_certificate', name: 'NA conversion certificate in case of Plot', mandatory: true },
      { id: 'collateral_oc_cc', name: 'OC/CC and Approved Building Plan', mandatory: true },
      { id: 'collateral_7_12', name: '7/12 Extract', mandatory: true },
      { id: 'collateral_society_noc', name: 'Society NOC', mandatory: true },
      { id: 'collateral_other', name: 'Any other Documents associated with Property', mandatory: true }
    ]
  }
};

function StudentDocumentsUpload() {
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});
  const [cosignerType, setCosignerType] = useState('employed'); // 'employed' | 'selfEmployed' | 'farmer' | 'none'

  const handleFileUpload = async (docId, file, category) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [docId]: 'File size must be less than 10MB' }));
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [docId]: 'Only PDF, JPG, and PNG files are allowed' }));
      return;
    }

    setUploading(prev => ({ ...prev, [docId]: true }));
    setErrors(prev => ({ ...prev, [docId]: null }));

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentId', docId);
      formData.append('category', category);

      const response = await apiClient.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadedDocs(prev => ({
          ...prev,
          [docId]: {
            fileName: file.name,
            uploadedAt: new Date(),
            url: response.data.url
          }
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        [docId]: error.response?.data?.error || 'Failed to upload document. Please try again.'
      }));
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleRemove = (docId) => {
    setUploadedDocs(prev => {
      const newDocs = { ...prev };
      delete newDocs[docId];
      return newDocs;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docId];
      return newErrors;
    });
  };

  const renderDocumentCard = (doc, category) => {
    const isUploaded = uploadedDocs[doc.id];
    const isUploading = uploading[doc.id];
    const error = errors[doc.id];
    const Icon = documentCategories[category].icon;

    return (
      <div key={doc.id} style={documentCardStyle}>
        <div style={documentCardHeaderStyle}>
          <div style={documentCardTitleWrapperStyle}>
            <Icon size={20} color={isUploaded ? '#22c55e' : '#64748b'} />
            <div>
              <h4 style={documentCardTitleStyle}>{doc.name}</h4>
              {doc.mandatory && (
                <span style={mandatoryBadgeStyle}>Required</span>
              )}
            </div>
          </div>
          {isUploaded && (
            <CheckCircle size={24} color="#22c55e" />
          )}
        </div>

        {error && (
          <div style={errorBoxStyle}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={errorTextStyle}>{error}</span>
          </div>
        )}

        {isUploaded ? (
          <div style={uploadedFileStyle}>
            <FileText size={18} color="#22c55e" />
            <span style={uploadedFileNameStyle}>{uploadedDocs[doc.id].fileName}</span>
            <button
              onClick={() => handleRemove(doc.id)}
              style={removeButtonStyle}
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label style={uploadButtonStyle}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(doc.id, file, category);
                }
              }}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <>
                <div style={spinnerStyle} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload Document</span>
              </>
            )}
          </label>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Required Documents</h1>
        <p style={subtitleStyle}>
          Please upload all mandatory documents to proceed with your loan application. All documents should be clear and legible.
        </p>
      </div>

      {/* Borrower Documents */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <User size={24} color="#22c55e" style={{ marginRight: '0.75rem' }} />
          {documentCategories.borrower.title}
        </h2>
        <div style={documentsGridStyle}>
          {documentCategories.borrower.documents.map(doc => renderDocumentCard(doc, 'borrower'))}
        </div>
      </section>

      {/* Parents Documents */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <Users size={24} color="#22c55e" style={{ marginRight: '0.75rem' }} />
          {documentCategories.parents.title}
        </h2>
        <div style={documentsGridStyle}>
          {documentCategories.parents.documents.map(doc => renderDocumentCard(doc, 'parents'))}
        </div>
      </section>

      {/* Co-Signer Type Selection */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <Users size={24} color="#22c55e" style={{ marginRight: '0.75rem' }} />
          Co-Signer Documents
        </h2>
        <div style={typeSelectorStyle}>
          <label style={typeLabelStyle}>Co-Signer Type:</label>
          <select
            value={cosignerType}
            onChange={(e) => setCosignerType(e.target.value)}
            style={typeSelectStyle}
          >
            <option value="none">No Co-Signer</option>
            <option value="employed">Employed</option>
            <option value="selfEmployed">Self Employed/Business</option>
            <option value="farmer">Farmer/Freelancer/Bluecollar jobs</option>
          </select>
        </div>

        {cosignerType !== 'none' && (
          <div style={documentsGridStyle}>
            {cosignerType === 'employed' && documentCategories.cosigner.documents.map(doc => renderDocumentCard(doc, 'cosigner'))}
            {cosignerType === 'selfEmployed' && documentCategories.cosignerSelfEmployed.documents.map(doc => renderDocumentCard(doc, 'cosignerSelfEmployed'))}
            {cosignerType === 'farmer' && documentCategories.cosignerFarmer.documents.map(doc => renderDocumentCard(doc, 'cosignerFarmer'))}
          </div>
        )}
      </section>

      {/* Collateral Documents */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <FileCheck size={24} color="#22c55e" style={{ marginRight: '0.75rem' }} />
          {documentCategories.collateral.title}
        </h2>
        <div style={infoBoxStyle}>
          <AlertCircle size={20} color="#f59e0b" />
          <span>Only required if you are applying for a collateral-based loan</span>
        </div>
        <div style={documentsGridStyle}>
          {documentCategories.collateral.documents.map(doc => renderDocumentCard(doc, 'collateral'))}
        </div>
      </section>

      {/* Submit Button */}
      <div style={submitSectionStyle}>
        <button
          onClick={() => {
            // Check if all mandatory documents are uploaded
            const allMandatoryUploaded = Object.values(documentCategories)
              .flatMap(cat => cat.documents)
              .filter(doc => doc.mandatory && (cosignerType === 'none' || !doc.id.startsWith('cosigner')))
              .every(doc => uploadedDocs[doc.id]);

            if (!allMandatoryUploaded) {
              alert('Please upload all mandatory documents before submitting.');
              return;
            }

            // Submit documents
            alert('Documents submitted successfully! Our team will review them shortly.');
          }}
          style={submitButtonStyle}
        >
          Submit All Documents
        </button>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
  backgroundColor: '#f8fafc'
};

const headerStyle = {
  marginBottom: '3rem',
  textAlign: 'center'
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '1rem'
};

const subtitleStyle = {
  fontSize: '1.125rem',
  color: '#64748b',
  lineHeight: 1.6
};

const sectionStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center'
};

const documentsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem'
};

const documentCardStyle = {
  border: '2px solid #e2e8f0',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  backgroundColor: '#ffffff',
  transition: 'all 0.2s ease'
};

const documentCardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
};

const documentCardTitleWrapperStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
  flex: 1
};

const documentCardTitleStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.25rem'
};

const mandatoryBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#ef4444',
  backgroundColor: '#fee2e2',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem'
};

const errorBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem',
  backgroundColor: '#fee2e2',
  borderRadius: '0.5rem',
  marginBottom: '1rem'
};

const errorTextStyle = {
  fontSize: '0.875rem',
  color: '#dc2626'
};

const uploadedFileStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  backgroundColor: '#dcfce7',
  borderRadius: '0.5rem',
  border: '1px solid #bbf7d0'
};

const uploadedFileNameStyle = {
  flex: 1,
  fontSize: '0.875rem',
  color: '#166534',
  fontWeight: 500
};

const removeButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '0.25rem',
  transition: 'background-color 0.2s'
};

const uploadButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%'
};

const spinnerStyle = {
  width: '20px',
  height: '20px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: '#ffffff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const typeSelectorStyle = {
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const typeLabelStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0f172a'
};

const typeSelectStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.95rem',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  outline: 'none'
};

const infoBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: '#fef3c7',
  borderRadius: '0.5rem',
  marginBottom: '1.5rem',
  color: '#92400e'
};

const submitSectionStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '3rem',
  padding: '2rem',
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const submitButtonStyle = {
  padding: '1rem 3rem',
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1.125rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
};

export default StudentDocumentsUpload;

// Add spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

