import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../config/axios';

const steps = [
  { id: 'borrower', title: 'Student', icon: User },
  { id: 'parents', title: 'Parents', icon: Users },
  { id: 'cosigner', title: 'Co-Signer', icon: Users },
  { id: 'collateral', title: 'Collateral', icon: FileText }
];

const documentCategories = {
  borrower: {
    title: 'Student Documents',
    documents: [
      { id: 'pan_card', name: 'PAN Card', mandatory: true },
      { id: 'aadhar_card', name: 'Aadhar Card', mandatory: true },
      { id: 'passport', name: 'Passport', mandatory: true },
      { id: 'admission_letter', name: 'University Admission Letter', mandatory: true },
      { id: 'entrance_score', name: 'Entrance Score Card (GRE/GMAT/IELTS/TOEFL)', mandatory: true },
      { id: 'academic_marksheets', name: 'Academic Marksheets (10th, 12th, Degree)', mandatory: true },
      { id: 'resume', name: 'Resume/CV', mandatory: true },
      { id: 'references', name: 'Two References (Contact Details)', mandatory: true },
      { id: 'salary_slips', name: 'Salary Slips (Last 3 Months)', mandatory: false },
      { id: 'bank_statements', name: 'Bank Statements (Last 6 Months)', mandatory: false },
      { id: 'form16_itr', name: 'Form 16 / ITR', mandatory: false }
    ]
  },
  parents: {
    title: 'Parent Documents',
    documents: [
      { id: 'mother_pan', name: 'Mother: PAN Card', mandatory: true },
      { id: 'mother_aadhar', name: 'Mother: Aadhar Card', mandatory: true },
      { id: 'mother_contact', name: 'Mother: Contact Details', mandatory: true },
      { id: 'father_pan', name: 'Father: PAN Card', mandatory: true },
      { id: 'father_aadhar', name: 'Father: Aadhar Card', mandatory: true },
      { id: 'father_contact', name: 'Father: Contact Details', mandatory: true }
    ]
  },
  cosigner: {
    title: 'Co-Signer Documents',
    typeSelector: true,
    documents: {
      employed: [
        { id: 'cosigner_pan_aadhar', name: 'PAN Card & Aadhar Card', mandatory: true },
        { id: 'cosigner_salary_slips', name: 'Salary Slips (Last 3 Months)', mandatory: true },
        { id: 'cosigner_bank_statements', name: 'Bank Statements (Salary Account - 1 Year)', mandatory: true },
        { id: 'cosigner_form16', name: 'Form 16 (Last 2 Years)', mandatory: true },
        { id: 'cosigner_electricity_bill', name: 'Electricity Bill (Address Proof)', mandatory: true },
        { id: 'cosigner_contact', name: 'Contact Details', mandatory: true }
      ],
      selfEmployed: [
        { id: 'cosigner_se_pan_aadhar', name: 'PAN Card & Aadhar Card', mandatory: true },
        { id: 'cosigner_se_itr', name: 'ITR (Last 2 Years + Computation)', mandatory: true },
        { id: 'cosigner_se_business_proof', name: 'Business Proof (GST/Udyam)', mandatory: true },
        { id: 'cosigner_se_bank_statements', name: 'Bank Statements (1 Year)', mandatory: true },
        { id: 'cosigner_se_electricity_bill', name: 'Electricity Bill', mandatory: true },
        { id: 'cosigner_se_contact', name: 'Contact Details', mandatory: true }
      ],
      farmer: [
        { id: 'cosigner_f_pan_aadhar', name: 'PAN Card & Aadhar Card', mandatory: true },
        { id: 'cosigner_f_income_cert', name: 'Income Certificate', mandatory: true },
        { id: 'cosigner_f_bank_statements', name: 'Bank Statements (6 Months)', mandatory: true },
        { id: 'cosigner_f_electricity_bill', name: 'Electricity Bill', mandatory: true }
      ]
    }
  },
  collateral: {
    title: 'Collateral Documents',
    documents: [
      { id: 'collateral_sale_agreement', name: 'Registered Sale Agreement', mandatory: true },
      { id: 'collateral_share_certificate', name: 'Share Certificate', mandatory: true },
      { id: 'collateral_property_docs', name: 'Property Documents (Sanction Plan)', mandatory: true },
      { id: 'collateral_na_certificate', name: 'NA Conversion Certificate', mandatory: true },
      { id: 'collateral_oc_cc', name: 'OC/CC & Approved Building Plan', mandatory: true },
      { id: 'collateral_7_12', name: '7/12 Extract', mandatory: true },
      { id: 'collateral_society_noc', name: 'Society NOC', mandatory: true },
      { id: 'collateral_other', name: 'Other Property Documents', mandatory: false }
    ]
  }
};

function StudentDocumentsUpload({ initialDocuments = {}, onUploadSuccess }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState(initialDocuments);

  // Sync with prop updates (e.g. after initial fetch)
  React.useEffect(() => {
    if (Object.keys(initialDocuments).length > 0) {
      setUploadedDocs(initialDocuments);
    }
  }, [initialDocuments]);
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});
  const [cosignerType, setCosignerType] = useState('employed');

  const activeCategory = steps[currentStep].id;
  const currentStepData = documentCategories[activeCategory];

  // Resolve documents for current step (handling cosigner types)
  let currentDocs = [];
  if (activeCategory === 'cosigner') {
    if (cosignerType !== 'none') {
      currentDocs = currentStepData.documents[cosignerType] || [];
    }
  } else {
    currentDocs = currentStepData.documents;
  }

  const handleFileUpload = async (docId, file, category) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [docId]: 'File too large (>10MB)' }));
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [docId]: 'Invalid file type (PDF/JPG/PNG only)' }));
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const docData = {
          fileName: file.name,
          uploadedAt: new Date(),
          url: response.data.url
        };

        setUploadedDocs(prev => ({
          ...prev,
          [docId]: docData
        }));

        if (onUploadSuccess) {
          onUploadSuccess(docId, docData);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        [docId]: 'Upload failed'
      }));
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Submit
      const allMandatoryUploaded = Object.values(documentCategories).flatMap(cat => {
        if (cat.documents.length) return cat.documents; // Regular categories
        if (cat.documents[cosignerType]) return cat.documents[cosignerType]; // Cosigner
        return [];
      }).filter(d => d.mandatory).every(d => uploadedDocs[d.id]);

      if (!allMandatoryUploaded) {
        toast.error('Please ensure all mandatory documents are uploaded across all sections.');
      } else {
        toast.success('Application Submitted Successfully!');
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Stepper Header */}
      <div style={stepperContainerStyle}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} style={stepWrapperStyle}>
              <div style={{
                ...stepCircleStyle,
                backgroundColor: isActive ? '#15803d' : isCompleted ? '#14532d' : '#e2e8f0', // Deep Brand Green Active
                color: (isActive || isCompleted) ? 'white' : '#64748b'
              }}>
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span style={{
                ...stepLabelStyle,
                color: isActive ? '#15803d' : isCompleted ? '#14532d' : '#94a3b8',
                fontWeight: isActive ? 700 : 500
              }}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: index < currentStep ? '#14532d' : '#e2e8f0',
                  margin: '0 1rem',
                  minWidth: '50px'
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>{currentStepData.title}</h2>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Upload the required documents below.
          </p>
        </div>

        {currentStepData.typeSelector && (
          <select
            value={cosignerType}
            onChange={(e) => setCosignerType(e.target.value)}
            style={selectStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#15803d';
              e.target.style.boxShadow = '0 0 0 3px rgba(21, 128, 61, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }}
          >
            <option value="none">No Co-Signer</option>
            <option value="employed">Employed</option>
            <option value="selfEmployed">Self Employed</option>
            <option value="farmer">Farmer/Blue Collar</option>
          </select>
        )}
      </div>

      {/* Grid Layout Cards */}
      {currentDocs.length > 0 ? (
        <div style={gridContainerStyle}>
          {currentDocs.map((doc) => {
            const isUploaded = uploadedDocs[doc.id];
            const isUploading = uploading[doc.id];
            const error = errors[doc.id];

            return (
              <div key={doc.id} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={cardTitleStyle} title={doc.name}>{doc.name}</div>
                  {doc.mandatory && <span style={mandatoryBadgeStyle}>Mandatory</span>}
                </div>

                <div style={cardBodyStyle}>
                  {isUploaded ? (
                    <div style={{ ...uploadedStateStyle, backgroundColor: '#C0EFD1', borderColor: '#86efac' }}>
                      <div style={{ ...fileIconWrapperStyle, borderColor: '#34d399' }}>
                        <FileText size={24} color="#15803d" />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ ...fileNameStyle, color: '#047857' }}>{uploadedDocs[doc.id].fileName}</div>
                        <div style={{ ...uploadTimeStyle, color: '#15803d' }}>Uploaded just now</div>
                      </div>
                      <button
                        onClick={() => setUploadedDocs(prev => {
                          const n = { ...prev };
                          delete n[doc.id];
                          return n;
                        })}
                        style={removeButtonStyle}
                        title="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label style={uploadZoneStyle} onMouseEnter={(e) => {
                      if (!isUploading) e.currentTarget.style.borderColor = '#15803d';
                      if (!isUploading) e.currentTarget.style.backgroundColor = '#C0EFD1';
                    }} onMouseLeave={(e) => {
                      if (!isUploading) e.currentTarget.style.borderColor = '#cbd5e1';
                      if (!isUploading) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}>
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(doc.id, e.target.files[0], activeCategory)}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="spinner" style={spinnerStyle}></div>
                          <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} color="#94a3b8" />
                          <span style={uploadTextStyle}>Click to Upload</span>
                          <span style={uploadSubTextStyle}>PDF, JPG, PNG (Max 10MB)</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {error && (
                  <div style={errorStyle}>
                    <AlertCircle size={14} style={{ marginRight: '4px' }} />
                    {error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          No documents required for this section based on your selection.
        </div>
      )}

      {/* Navigation Footer */}
      <div style={footerStyle}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{
            ...prevButtonStyle,
            borderColor: currentStep === 0 ? '#e2e8f0' : '#15803d',
            color: currentStep === 0 ? '#94a3b8' : '#15803d',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (currentStep !== 0) {
              e.currentTarget.style.backgroundColor = '#C0EFD1';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          onClick={handleNext}
          style={nextButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#C0EFD1';
            e.currentTarget.style.borderColor = '#15803d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#15803d';
          }}
        >
          {currentStep === steps.length - 1 ? 'Submit Application' : 'Save & Next'}
          {currentStep < steps.length - 1 && <ChevronRight size={18} />}
        </button>
      </div>

      {/* Styles for Spinner */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Styles
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem',
  fontFamily: "'Outfit', sans-serif"
};

const stepperContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '2.5rem',
  padding: '0 1rem'
};

const stepWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1
};

const stepCircleStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '0.75rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const stepLabelStyle = {
  fontSize: '0.95rem',
  whiteSpace: 'nowrap'
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'end',
  marginBottom: '1.5rem',
  padding: '0 0.5rem'
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#111827', // Black/Dark Gray
  margin: 0
};

const selectStyle = {
  appearance: 'none',
  padding: '0.6rem 2.5rem 0.6rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  color: '#334155',
  backgroundColor: 'white',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  minWidth: '200px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: "'Outfit', sans-serif"
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const cardStyle = {
  backgroundColor: 'white', // White background
  borderRadius: '12px',
  border: '2px solid #9333ea', // Violet-600 border
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  position: 'relative'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '0.5rem'
};

const cardTitleStyle = {
  fontWeight: 600,
  color: '#111827', // Black/Dark Gray for text
  fontSize: '1rem',
  lineHeight: 1.4
};

const mandatoryBadgeStyle = {
  backgroundColor: '#fca5a5', // Red-300 bg for mandatory
  color: '#991b1b', // Red-800 text
  padding: '0.15rem 0.5rem',
  borderRadius: '999px',
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  alignSelf: 'flex-start'
};

const cardBodyStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
};

const uploadZoneStyle = {
  border: '2px dashed #a7f3d0', // Green-200 dashed border
  borderRadius: '8px',
  backgroundColor: '#f8fafc', // Very subtle slate/gray bg for contrast
  padding: '1.5rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '120px'
};

const uploadTextStyle = {
  color: '#15803d',
  fontWeight: 600,
  fontSize: '0.9rem'
};

const uploadSubTextStyle = {
  color: '#94a3b8',
  fontSize: '0.75rem'
};

const uploadedStateStyle = {
  backgroundColor: '#C0EFD1',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  minHeight: '80px'
};

const fileIconWrapperStyle = {
  backgroundColor: 'white',
  borderRadius: '6px',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #dcfce7'
};

const fileNameStyle = {
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#14532d',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const uploadTimeStyle = {
  fontSize: '0.7rem',
  color: '#14532d',
  opacity: 0.8
};

const removeButtonStyle = {
  background: 'white',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  color: '#ef4444',
  padding: '0.4rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  color: '#dc2626',
  fontSize: '0.75rem',
  marginTop: '0.5rem',
  backgroundColor: '#fef2f2',
  padding: '0.5rem',
  borderRadius: '6px'
};

const spinnerStyle = {
  width: '24px',
  height: '24px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#15803d',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const emptyStateStyle = {
  padding: '4rem',
  textAlign: 'center',
  color: '#64748b',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginBottom: '2rem'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '1rem',
  padding: '1rem 0',
  borderTop: '1px solid #e2e8f0'
};

const prevButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.75rem',
  backgroundColor: 'white',
  border: '1px solid #15803d',
  borderRadius: '8px',
  color: '#15803d',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '1rem'
};

const nextButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.75rem',
  backgroundColor: 'white',
  color: '#15803d',
  border: '1px solid #15803d',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '1rem'
};

export default StudentDocumentsUpload;
