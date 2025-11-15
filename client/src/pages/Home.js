import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/axios';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  GraduationCap,
  Globe,
  Shield,
  Smartphone,
  X,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const studyCountryOptions = [
  { value: 'United Kingdom (UK)', label: 'United Kingdom (UK)', flag: '🇬🇧' },
  { value: 'United States (USA)', label: 'United States (USA)', flag: '🇺🇸' },
  { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'India', label: 'India', flag: '🇮🇳' }
];

const universityOptions = [
  'University Of California Davis',
  'Columbia University',
  'University Of North Texas',
  'Western Carolina University',
  'Arizona State University',
  'School Of Visual Arts',
  'Harvard University',
  'Massachusetts Institute of Technology',
  'University of Toronto',
  'London School of Economics',
  'University of Oxford',
  'University of Cambridge',
  'National University of Singapore',
  'Technical University of Munich',
  'Australian National University'
];

const admissionStatusOptions = [
  {
    value: 'applied',
    title: 'Applied',
    description: 'Completed the application process with university'
  },
  {
    value: 'confirmed',
    title: 'Confirmed',
    description: 'Availed offer letter from the university'
  },
  {
    value: 'not_applied',
    title: 'Not Applied yet',
    description: 'Planning to apply soon...'
  }
];

const intakeOptions = ['Jan 2026', 'May 2026', 'Sep 2026', 'Jan 2027'];

const loanRangeOptions = [
  '₹8 - ₹10 lacs',
  '₹11 - ₹20 lacs',
  '₹21 - ₹30 lacs',
  '₹31 - ₹50 lacs',
  'More than ₹50 lacs'
];

const stepConfig = [
  { title: 'Study Destination', subtitle: 'Choose where you plan to study' },
  { title: 'Admission Status', subtitle: 'Tell us your university progress' },
  { title: 'Intake Plan', subtitle: 'Share your target intake' },
  { title: 'Preferred University', subtitle: 'Pick your dream university' },
  { title: 'Loan Requirement', subtitle: 'Select your expected loan range' },
  { title: 'Contact Details', subtitle: 'Help us reach you quickly' }
];

function EligibilityWizard({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    studyCountry: '',
    admissionStatus: '',
    intake: '',
    universityPreference: '',
    loanRange: '',
    fullName: '',
    email: '',
    phone: '',
    city: ''
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [universitySearch, setUniversitySearch] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setFormData({
        studyCountry: '',
        admissionStatus: '',
        intake: '',
        universityPreference: '',
        loanRange: '',
        fullName: '',
        email: '',
        phone: '',
        city: ''
      });
      setCountrySearch('');
      setUniversitySearch('');
      setError('');
      setSubmitting(false);
      setSubmittedLead(null);
    }
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return studyCountryOptions;
    return studyCountryOptions.filter((option) =>
      option.label.toLowerCase().includes(countrySearch.trim().toLowerCase())
    );
  }, [countrySearch]);

  const filteredUniversities = useMemo(() => {
    if (!universitySearch.trim()) return universityOptions;
    return universityOptions.filter((option) =>
      option.toLowerCase().includes(universitySearch.trim().toLowerCase())
    );
  }, [universitySearch]);

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 0:
        if (!formData.studyCountry) {
          setError('Select a country to continue');
          return false;
        }
        return true;
      case 1:
        if (!formData.admissionStatus) {
          setError('Select your current admission status');
          return false;
        }
        return true;
      case 2:
        if (!formData.intake) {
          setError('Select your intake to continue');
          return false;
        }
        return true;
      case 3:
        if (!formData.universityPreference) {
          setError('Select a preferred university to continue');
          return false;
        }
        return true;
      case 4:
        if (!formData.loanRange) {
          setError('Select your required loan range');
          return false;
        }
        return true;
      case 5: {
        if (!formData.fullName.trim()) {
          setError('Please enter your full name');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Please enter your email address');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          setError('Enter a valid email address');
          return false;
        }
        if (!formData.phone.trim()) {
          setError('Please provide your phone number so we can reach you');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, stepConfig.length - 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onClose();
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        studyCountry: formData.studyCountry,
        admissionStatus: formData.admissionStatus,
        intake: formData.intake,
        universityPreference: formData.universityPreference,
        loanRange: formData.loanRange,
        city: formData.city.trim() || undefined
      };
      const response = await apiClient.post('/api/leads', payload);
      setSubmittedLead(response.data.lead);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to submit enquiry. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (submittedLead) {
    return (
      <div style={overlayStyle}>
        <div style={wizardContainerStyle}>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close wizard">
            <X size={20} />
          </button>
          <div style={successHeaderStyle}>
            <CheckCircle size={48} color="#16a34a" />
            <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.75rem', color: '#0f172a' }}>
              Thank you, {submittedLead.fullName.split(' ')[0]}!
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
              Your study abroad loan enquiry has been received. Our education loan expert will reach out to you within
              24 hours to guide you through the next steps.
            </p>
          </div>
          <div style={successCardStyle}>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Email</span>
              <span style={successCardValueStyle}>{submittedLead.email}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Preferred Destination</span>
              <span style={successCardValueStyle}>{submittedLead.studyCountry}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Loan Requirement</span>
              <span style={successCardValueStyle}>{submittedLead.loanRange}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Admission Status</span>
              <span style={successCardValueStyle}>
                {admissionStatusOptions.find((option) => option.value === submittedLead.admissionStatus)?.title ||
                  submittedLead.admissionStatus}
              </span>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Meanwhile, feel free to explore resources tailored to your destination and program. You can always come back
            and track your loan journey once we activate your student portal.
          </p>
          <button onClick={onClose} style={primaryButtonStyle}>
            Close & Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={wizardContainerStyle}>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close wizard">
          <X size={20} />
        </button>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Quick Eligibility Check
          </h2>
          <p style={{ color: '#475569', marginBottom: '1rem' }}>
            Answer a few quick questions to help us personalise your education loan journey.
          </p>
          <div style={progressWrapperStyle}>
            <div
              style={{
                ...progressBarStyle,
                width: `${((currentStep + 1) / stepConfig.length) * 100}%`
              }}
            />
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#0f172a', fontWeight: 600 }}>{stepConfig[currentStep].title}</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{stepConfig[currentStep].subtitle}</p>
            </div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Step {currentStep + 1} of {stepConfig.length}
            </span>
          </div>
          <div style={stepTrackerStyle}>
            {stepConfig.map((step, index) => {
              const active = index <= currentStep;
              return (
                <div
                  key={step.title}
                  style={{
                    ...stepTrackerItemStyle,
                    borderColor: active ? '#2563eb' : '#e2e8f0',
                    backgroundColor: active ? '#eff6ff' : 'white',
                    color: active ? '#1d4ed8' : '#475569'
                  }}
                >
                  <span
                    style={{
                      ...stepTrackerBadgeStyle,
                      backgroundColor: active ? '#2563eb' : '#e2e8f0',
                      color: active ? 'white' : '#475569'
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={wizardBodyStyle}>{renderStepContent()}</div>

        <div style={footerActionsStyle}>
          <button onClick={handleBack} style={secondaryButtonStyle}>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < stepConfig.length - 1 ? (
            <button onClick={handleNext} style={primaryButtonStyle}>
              Continue
              <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          ) : (
            <button onClick={handleSubmit} style={{ ...primaryButtonStyle, minWidth: '180px' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                style={searchInputStyle}
              />
            </div>
            <div style={gridStyle}>
              {filteredCountries.map((country) => {
                const active = formData.studyCountry === country.value;
                return (
                  <button
                    key={country.value}
                    onClick={() => handleSelect('studyCountry', country.value)}
                    style={{
                      ...cardButtonStyle,
                      borderColor: active ? '#2563eb' : '#e2e8f0',
                      backgroundColor: active ? '#eff6ff' : 'white'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{country.flag}</span>
                    <span style={{ fontWeight: 600 }}>{country.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        );
      case 1:
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {admissionStatusOptions.map((option) => {
              const active = formData.admissionStatus === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect('admissionStatus', option.value)}
                  style={{
                    ...cardButtonStyle,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderColor: active ? '#22c55e' : '#e2e8f0',
                    backgroundColor: active ? '#ecfdf5' : 'white'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{option.title}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{option.description}</p>
                  </div>
                  {active && <CheckCircle size={24} color="#16a34a" />}
                </button>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div style={gridStyle}>
            {intakeOptions.map((option) => {
              const active = formData.intake === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect('intake', option)}
                  style={{
                    ...cardButtonStyle,
                    borderColor: active ? '#f59e0b' : '#e2e8f0',
                    background: active
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                  }}
                >
                  <Clock size={24} color={active ? '#9a3412' : '#475569'} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{option}</span>
                </button>
              );
            })}
          </div>
        );
      case 3:
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                placeholder="Search universities..."
                style={searchInputStyle}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredUniversities.map((university) => {
                const active = formData.universityPreference === university;
                return (
                  <button
                    key={university}
                    onClick={() => handleSelect('universityPreference', university)}
                    style={{
                      ...listItemStyle,
                      borderColor: active ? '#2563eb' : '#e2e8f0',
                      backgroundColor: active ? '#eff6ff' : 'white'
                    }}
                  >
                    <Building size={18} style={{ marginRight: '0.75rem', color: '#2563eb' }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{university}</span>
                    {active && <CheckCircle size={18} color="#2563eb" />}
                  </button>
                );
              })}
            </div>
          </>
        );
      case 4:
        return (
          <div style={gridStyle}>
            {loanRangeOptions.map((option) => {
              const active = formData.loanRange === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect('loanRange', option)}
                  style={{
                    ...cardButtonStyle,
                    borderColor: active ? '#16a34a' : '#d6deeb',
                    backgroundColor: active ? '#f0fdf4' : '#ffffff'
                  }}
                >
                  <Shield size={24} color={active ? '#15803d' : '#475569'} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{option}</span>
                </button>
              );
            })}
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Name*</label>
              <div style={inputWrapperStyle}>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleSelect('fullName', e.target.value)}
                  placeholder="John Smith"
                  style={textInputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email ID*</label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleSelect('email', e.target.value)}
                  placeholder="johnsmith@email.com"
                  style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label style={labelStyle}>Phone Number*</label>
                <div style={inputWrapperStyle}>
                  <Phone size={18} style={inputIconStyle} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleSelect('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <div style={inputWrapperStyle}>
                  <MapPin size={18} style={inputIconStyle} />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleSelect('city', e.target.value)}
                    placeholder="Permanent city"
                    style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  zIndex: 2000
};

const wizardContainerStyle = {
  width: '100%',
  maxWidth: '960px',
  minHeight: '82vh',
  maxHeight: '90vh',
  backgroundColor: '#ffffff',
  borderRadius: '1.75rem',
  padding: '3rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 40px 120px rgba(15, 23, 42, 0.22)'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '2rem',
  right: '2rem',
  border: 'none',
  background: 'rgba(15,23,42,0.06)',
  cursor: 'pointer',
  color: '#0f172a',
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const progressWrapperStyle = {
  height: '6px',
  width: '100%',
  backgroundColor: '#e2e8f0',
  borderRadius: '999px',
  overflow: 'hidden'
};

const progressBarStyle = {
  height: '100%',
  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  transition: 'width 0.4s ease'
};

const stepTrackerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '0.5rem',
  marginTop: '1.25rem'
};

const stepTrackerItemStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  padding: '0.6rem 0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease'
};

const stepTrackerBadgeStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '0.65rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.9rem'
};

const wizardBodyStyle = {
  flex: 1,
  marginTop: '1.5rem',
  overflowY: 'auto',
  paddingRight: '0.5rem'
};

const searchInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  border: '1px solid #cbd5f5',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: '#f8fafc'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem'
};

const cardButtonStyle = {
  borderRadius: '1rem',
  border: '1px solid #d6deeb',
  padding: '1rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease'
};

const listItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #d6deeb',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  marginBottom: '0.75rem',
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)'
};

const errorBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#fee2e2',
  border: '1px solid #fca5a5',
  color: '#b91c1c',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  marginBottom: '1rem'
};

const footerActionsStyle = {
  marginTop: '2rem',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem'
};

const primaryButtonStyle = {
  backgroundColor: '#1d4ed8',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  padding: '0.9rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 16px 34px rgba(29, 78, 216, 0.2)'
};

const secondaryButtonStyle = {
  backgroundColor: '#f1f5f9',
  color: '#1f2937',
  border: '1px solid #d0d7e2',
  borderRadius: '0.75rem',
  padding: '0.9rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.35rem',
  display: 'block'
};

const inputWrapperStyle = {
  position: 'relative'
};

const inputIconStyle = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b'
};

const textInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  backgroundColor: '#f8fafc',
  outline: 'none'
};

const successHeaderStyle = {
  textAlign: 'center',
  marginBottom: '1.75rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const successCardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1.25rem',
  marginBottom: '1.5rem',
  display: 'grid',
  gap: '0.75rem',
  backgroundColor: '#f8fafc'
};

const successCardRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem'
};

const successCardLabelStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  fontWeight: 500
};

const successCardValueStyle = {
  fontSize: '1rem',
  color: '#0f172a',
  fontWeight: 600
};

function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();

  const featureCards = [
    {
      icon: <Shield size={32} color="#2563eb" />,
      title: '100% Coverage',
      description: 'Loan up to ₹1.5 Cr covering tuition, living, travel and insurance for your entire program.'
    },
    {
      icon: <Clock size={32} color="#4f46e5" />,
      title: 'Quick Approvals',
      description: 'Get provisional sanction in 48 hours with our priority underwriting desk for top universities.'
    },
    {
      icon: <Smartphone size={32} color="#16a34a" />,
      title: 'Digital Journey',
      description: 'Submit documents, track progress and complete KYC in one secure portal built for students.'
    }
  ];

  const stats = [
    { label: 'Students Counselled', value: '64,800+' },
    { label: 'Institutes Onboarded', value: '1,700+' },
    { label: 'Countries Covered', value: '51' }
  ];

  const journeySteps = [
    {
      badge: 'Step 01',
      title: 'Check Eligibility Online',
      detail: 'Complete the guided questionnaire to help us understand your destination, intake and funding requirement.',
      meta: 'Takes less than 3 minutes'
    },
    {
      badge: 'Step 02',
      title: 'Speak With a Loan Expert',
      detail: 'An education loan specialist calls you to validate information, discuss lenders and explain documentation.',
      meta: 'Expert call within 24 hours'
    },
    {
      badge: 'Step 03',
      title: 'Receive Verification Link',
      detail: 'We send a secure link to your email so you can activate your LoanFlow account and set your password.',
      meta: 'Single-click secure verification'
    },
    {
      badge: 'Step 04',
      title: 'Submit Details & Documents',
      detail: 'Log in to your portal, add academic, financial and co-applicant information, and upload supporting documents.',
      meta: 'Dedicated checklist inside the portal'
    },
    {
      badge: 'Step 05',
      title: 'Track Application to Disbursal',
      detail: 'Monitor every milestone—verification, bank submission, sanction readiness and loan credited to your account.',
      meta: 'Real-time status updates'
    }
  ];

  const trackingStatuses = [
    { name: 'Verification in Progress', description: 'Our team is validating your profile and supporting documents.' },
    { name: 'Verification Successful', description: 'All information is cleared; documentation pack is ready for the lender.' },
    { name: 'Submitted to Bank', description: 'Your application and documents are under review with the lending partner.' },
    { name: 'Ready to Sanction', description: 'Bank has approved in principle and is preparing the sanction letter.' },
    { name: 'Funds Disbursed', description: 'Loan amount is released to the beneficiary account as per fee schedule.' }
  ];

  const testimonials = [
    {
      name: 'Akarsh Deep',
      program: 'MS in Data Science, University of Glasgow',
      message:
        'LoanFlow understood my education goals, compared lenders and hand-held the process till disbursement. Their expert secured the best rate for me.'
    },
    {
      name: 'Meera Patel',
      program: 'MBA, Arizona State University',
      message:
        'The portal simplified every step. I could check my eligibility, upload documents and monitor the timeline without chasing multiple people.'
    },
    {
      name: 'Mohammed S.',
      program: 'MEng, University of Toronto',
      message:
        'I needed a co-applicant free option. LoanFlow matched me with the right NBFC and coordinated with the university for fee payments.'
    }
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <header style={heroSectionStyle}>
        <nav style={navStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={logoMarkStyle}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={logoTextStyle}>LoanFlow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={ghostButtonStyle} onClick={() => setWizardOpen(true)}>
              Check eligibility
            </button>
            <button style={whiteButtonStyle} onClick={() => navigate('/login')}>
              Log in
            </button>
          </div>
        </nav>
        <div style={heroLayoutStyle}>
          <div style={heroContentStyle}>
            <p style={heroEyebrowStyle}>Education Loan Programme</p>
            <h1 style={heroHeadingStyle}>Official loan desk for international study plans</h1>
            <p style={heroSubheadingStyle}>
              LoanFlow offers a single-window service to assess eligibility, coordinate with lending partners and keep you
              informed from enquiry to final disbursal.
            </p>
            <div style={heroActionsStyle}>
              <button style={ctaButtonStyle} onClick={() => setWizardOpen(true)}>
                Start eligibility check
                <ArrowRight size={18} style={{ marginLeft: '0.75rem' }} />
              </button>
              <button style={outlineButtonStyle} onClick={() => navigate('/login')}>
                Access your portal
              </button>
            </div>
          </div>
          <aside style={heroSideCardStyle}>
            <div style={heroStatsHeaderStyle}>
              <Shield size={20} color="#155e75" />
              <span>Trusted Guidance</span>
            </div>
            <div style={statsBarStyle}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p style={statValueStyle}>{stat.value}</p>
                  <p style={statLabelStyle}>{stat.label}</p>
                </div>
              ))}
            </div>
            <div style={heroStepPreviewStyle}>
              {journeySteps.slice(0, 3).map((step) => (
                <div key={step.badge} style={heroStepItemStyle}>
                  <span style={heroStepBadgeStyle}>{step.badge}</span>
                  <div>
                    <p style={heroStepTitleStyle}>{step.title}</p>
                    <p style={heroStepMetaStyle}>{step.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </header>

      <main style={{ backgroundColor: '#f8fafc' }}>
        <section style={featuresSectionStyle}>
          <h2 style={sectionHeadingStyle}>Why students choose LoanFlow</h2>
          <div style={featureGridStyle}>
            {featureCards.map((feature) => (
              <div key={feature.title} style={featureCardStyle}>
                <div style={featureIconWrapperStyle}>{feature.icon}</div>
                <h3 style={featureTitleStyle}>{feature.title}</h3>
                <p style={featureDescriptionStyle}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={journeySectionStyle}>
          <div style={journeyHeaderStyle}>
            <div>
              <h2 style={sectionHeadingStyle}>Your loan journey, end to end</h2>
              <p style={sectionSubheadingStyle}>
                Every engagement follows a structured workflow so you always know what happens next.
              </p>
            </div>
            <button style={ctaSecondaryButtonStyle} onClick={() => setWizardOpen(true)}>
              Begin your loan journey
            </button>
          </div>
          <div style={journeyGridStyle}>
            {journeySteps.map((step) => (
              <div key={step.badge} style={journeyCardStyle}>
                <span style={journeyBadgeStyle}>{step.badge}</span>
                <h3 style={journeyTitleStyle}>{step.title}</h3>
                <p style={journeyDetailStyle}>{step.detail}</p>
                <p style={journeyMetaStyle}>{step.meta}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={trackingSectionStyle}>
          <div style={trackingIntroStyle}>
            <h2 style={sectionHeadingStyle}>Transparent application tracking</h2>
            <p style={sectionSubheadingStyle}>
              Once your profile is verified you gain access to the LoanFlow portal and see these milestones update in real time.
            </p>
          </div>
          <div style={trackingGridStyle}>
            {trackingStatuses.map((status, index) => (
              <div key={status.name} style={trackingCardStyle}>
                <div style={trackingBadgeStyle}>Stage {index + 1}</div>
                <h3 style={trackingTitleStyle}>{status.name}</h3>
                <p style={trackingDescriptionStyle}>{status.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={testimonialSectionStyle}>
          <h2 style={sectionHeadingStyle}>Students moving closer to their dream campuses</h2>
          <div style={testimonialGridStyle}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} style={testimonialCardStyle}>
                <Globe size={28} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
                <p style={testimonialMessageStyle}>"{testimonial.message}"</p>
                <p style={testimonialNameStyle}>{testimonial.name}</p>
                <p style={testimonialProgramStyle}>{testimonial.program}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <EligibilityWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}

const heroSectionStyle = {
  background: 'linear-gradient(135deg, #f8fbff 0%, #e6efff 70%)',
  padding: '0 6vw 4.5rem',
  borderBottom: '1px solid #e2e8f0'
};

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '1.75rem'
};

const logoMarkStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.18)'
};

const logoTextStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: '#0f172a'
};

const heroLayoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)',
  gap: '3rem',
  alignItems: 'center',
  marginTop: '3.5rem'
};

const heroContentStyle = {
  maxWidth: '620px'
};

const heroEyebrowStyle = {
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#1d4ed8'
};

const heroHeadingStyle = {
  fontSize: '3rem',
  lineHeight: 1.15,
  marginTop: '1rem',
  fontWeight: 700,
  color: '#0f172a'
};

const heroSubheadingStyle = {
  fontSize: '1.05rem',
  lineHeight: 1.7,
  margin: '1.25rem 0 1.75rem',
  color: '#475569'
};

const heroActionsStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const ctaButtonStyle = {
  backgroundColor: '#1d4ed8',
  border: 'none',
  borderRadius: '0.85rem',
  padding: '0.85rem 1.85rem',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  boxShadow: '0 16px 30px rgba(29, 78, 216, 0.22)'
};

const outlineButtonStyle = {
  borderRadius: '0.85rem',
  border: '1px solid #1d4ed8',
  background: 'transparent',
  color: '#1d4ed8',
  padding: '0.85rem 1.6rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const heroSideCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1.5rem',
  padding: '2rem',
  border: '1px solid #d8e3f8',
  boxShadow: '0 28px 60px rgba(15, 23, 42, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const heroStatsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontWeight: 600,
  color: '#155e75'
};

const statsBarStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '1.25rem'
};

const statValueStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0f172a'
};

const statLabelStyle = {
  marginTop: '0.35rem',
  color: '#64748b',
  fontSize: '0.95rem'
};

const heroStepPreviewStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const heroStepItemStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start'
};

const heroStepBadgeStyle = {
  backgroundColor: '#e0e7ff',
  color: '#1d4ed8',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  padding: '0.35rem 0.6rem',
  borderRadius: '999px'
};

const heroStepTitleStyle = {
  fontWeight: 600,
  color: '#0f172a'
};

const heroStepMetaStyle = {
  marginTop: '0.3rem',
  color: '#64748b',
  fontSize: '0.8rem'
};

const featuresSectionStyle = {
  padding: '5rem 6vw 3rem'
};

const sectionHeadingStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#0f172a',
  textAlign: 'center',
  marginBottom: '2rem'
};

const sectionSubheadingStyle = {
  marginTop: '0.75rem',
  color: '#475569',
  lineHeight: 1.7,
  fontSize: '1rem',
  textAlign: 'left'
};

const featureGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.5rem'
};

const featureCardStyle = {
  padding: '2rem',
  borderRadius: '1.25rem',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.04)',
  textAlign: 'left'
};

const featureIconWrapperStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  backgroundColor: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem'
};

const featureTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.75rem'
};

const featureDescriptionStyle = {
  color: '#475569',
  lineHeight: 1.6,
  fontSize: '0.95rem'
};

const ctaSecondaryButtonStyle = {
  borderRadius: '0.85rem',
  border: '1px solid #1d4ed8',
  background: '#1d4ed8',
  color: 'white',
  padding: '0.85rem 1.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 16px 32px rgba(29, 78, 216, 0.18)'
};

const journeySectionStyle = {
  padding: '4.5rem 6vw'
};

const journeyHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1.5rem',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  marginBottom: '2.5rem'
};

const journeyGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.5rem'
};

const journeyCardStyle = {
  backgroundColor: 'white',
  borderRadius: '1.25rem',
  border: '1px solid #dde6f5',
  padding: '1.75rem',
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const journeyBadgeStyle = {
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#1d4ed8',
  fontWeight: 600
};

const journeyTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#0f172a'
};

const journeyDetailStyle = {
  color: '#475569',
  lineHeight: 1.6,
  fontSize: '0.95rem'
};

const journeyMetaStyle = {
  marginTop: '0.25rem',
  color: '#1d4ed8',
  fontWeight: 500,
  fontSize: '0.9rem'
};

const trackingSectionStyle = {
  padding: '4.5rem 6vw',
  backgroundColor: '#f1f5f9'
};

const trackingIntroStyle = {
  maxWidth: '640px',
  margin: '0 auto 2.5rem',
  textAlign: 'center'
};

const trackingGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.5rem'
};

const trackingCardStyle = {
  backgroundColor: 'white',
  borderRadius: '1rem',
  border: '1px solid #e2e8f0',
  padding: '1.5rem',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)'
};

const trackingBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e0e7ff',
  color: '#1d4ed8',
  fontWeight: 600,
  fontSize: '0.75rem',
  borderRadius: '999px',
  padding: '0.35rem 0.75rem',
  marginBottom: '0.75rem'
};

const trackingTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.5rem'
};

const trackingDescriptionStyle = {
  color: '#475569',
  lineHeight: 1.6,
  fontSize: '0.9rem'
};

const testimonialSectionStyle = {
  padding: '4.5rem 6vw'
};

const testimonialGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.5rem'
};

const testimonialCardStyle = {
  padding: '2rem',
  borderRadius: '1.25rem',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  boxShadow: '0 15px 35px rgba(15, 23, 42, 0.06)',
  minHeight: '220px'
};

const testimonialMessageStyle = {
  color: '#475569',
  fontStyle: 'italic',
  lineHeight: 1.7,
  marginBottom: '1.5rem'
};

const testimonialNameStyle = {
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.25rem'
};

const testimonialProgramStyle = {
  color: '#64748b',
  fontSize: '0.9rem'
};

const ghostButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#1d4ed8',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const whiteButtonStyle = {
  backgroundColor: 'white',
  color: '#0f172a',
  borderRadius: '0.75rem',
  border: '1px solid #dbe2f5',
  padding: '0.65rem 1.25rem',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)'
};

export default Home;

