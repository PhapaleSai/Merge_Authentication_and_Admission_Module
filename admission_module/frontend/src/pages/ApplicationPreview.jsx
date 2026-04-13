import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormStore from '../store/useFormStore';
import { getApplicationDetails, getUploadedDocuments, finalizeApplication } from '../api/erpApi';

export default function ApplicationPreview() {
  const navigate = useNavigate();
  const { global, setGlobalState } = useFormStore();
  
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!global.applicationId) {
        setLoading(false);
        return;
      }
      try {
        const appData = await getApplicationDetails(global.applicationId);
        setApplication(appData);
        
        // SYNC STATUS: Ensure the UI knows the real status from the backend
        if (appData && appData.current_status) {
          setGlobalState({ status: appData.current_status });
        }
        
        const docsData = await getUploadedDocuments(global.applicationId);
        setDocuments(docsData || []);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
           console.warn("Application ID no longer exists on server. Resetting local state.");
           setGlobalState({ applicationId: null, status: 'paid_brochure' });
           if (window.ERP && window.ERP.Toast) {
              window.ERP.Toast.show("Your application data was out of sync. Please fill the form again.", "warning");
           }
           navigate('/'); // Go to dashboard
        } else {
           if (window.ERP && window.ERP.Toast) {
             window.ERP.Toast.show('Error fetching application preview details.', 'danger');
           }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [global.applicationId]);

  if (!global.applicationId) {
    return (
      <main className="erp-main">
        <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: 'var(--erp-text-muted)', marginBottom: '16px' }}></i>
          <h2>No Application Found</h2>
          <p>Please start your application from the Dashboard.</p>
          <button className="erp-btn erp-btn--primary" onClick={() => navigate('/apply')}>Start Application</button>
        </div>
      </main>
    );
  }

  if (loading) return <main className="erp-main" style={{ padding: '24px' }}>Loading application preview...</main>;
  if (!application) return <main className="erp-main" style={{ padding: '24px' }}>Application not found.</main>;

  const applicant = application.applicant_details || {};
  const parent = application.parent_details || {};
  const education = application.education_details || [];

  const handlePrint = () => {
    window.print();
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await finalizeApplication({ applicationId: global.applicationId, userId: global.userId });
      
      // Update local and global state
      setIsSuccessfullySubmitted(true);
      setGlobalState({ status: 'submitted' });

      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Application successfully submitted!', 'success');
      }
      // We don't navigate immediately anymore so the user can see the green success state
    } catch (err) {
      console.error(err);
      const detail = err.message || '';
      if (detail.includes("Mandatory documents missing")) {
         if (detail.includes("No documents are linked")) {
            // This really means something is wrong with the DB link
            if (window.ERP && window.ERP.Toast) {
               window.ERP.Toast.show('Error: Application data missing in DB. Go back to Dashboard and Start Again.', 'danger');
            }
         } else {
            // This means we found files but naming/type is wrong
            if (window.ERP && window.ERP.Toast) {
               window.ERP.Toast.show('Error: Some required documents are not named correctly. Please re-upload them.', 'warning');
            }
         }
      } else {
         if (window.ERP && window.ERP.Toast) {
            window.ERP.Toast.show(detail || 'Submission failed.', 'danger');
         }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = ['submitted', 'under_review', 'approved', 'rejected', 'enrolled'].includes(global.status);

  return (
    <main className="erp-main print-container" data-erp-page="Applicant / Application Preview">
      
      {/* Controls visible only on screen, hidden on print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--erp-card-bg)', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
         <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Application Preview</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--erp-text-muted)', fontSize: '14px' }}>Review your details before final submission.</p>
         </div>
         <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="erp-btn erp-btn--outline" onClick={handlePrint}>
               <i className="fa-solid fa-print"></i> Print / Save as PDF
            </button>
            
            {(isReadOnly || isSuccessfullySubmitted) && global.status !== 'revision_required' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="erp-badge erp-badge--success" style={{ padding: '8px 16px', fontSize: '14px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                  <i className="fa-solid fa-circle-check"></i> Application Submitted
                </div>
                <button className="erp-btn erp-btn--primary" onClick={() => navigate('/status')}>
                  <i className="fa-solid fa-clock-rotate-left"></i> Track Status
                </button>
              </div>
            )}
         </div>
      </div>

      {/* Official Form Header for Print */}
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '32px', display: 'none' }}>
         <h1 style={{ margin: 0 }}>PVG's College of Science, Pune</h1>
         <h2 style={{ margin: '8px 0', fontSize: '18px' }}>Official Admission Application Form</h2>
         <p style={{ margin: 0 }}>Academic Year 2025-26 &middot; Application No: <strong>{application.application_id}</strong></p>
         <hr style={{ margin: '16px 0' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Core Info */}
        <section className="erp-card">
          <div className="erp-card__header"><div className="erp-card__title">Program Applied For</div></div>
          <div className="erp-card__body">
            <div><strong>Target Course:</strong> {application.course_name}</div>
            <div style={{ marginTop: '8px' }}><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{application.current_status}</span></div>
          </div>
        </section>

        {/* Applicant Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Applicant Details</div>
          </div>
          <div className="erp-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Full Name:</strong> {applicant.full_name}</div>
              <div><strong>Email:</strong> {applicant.email}</div>
              <div><strong>Mobile:</strong> {applicant.mobile_number}</div>
              <div><strong>DOB:</strong> {applicant.dob}</div>
              <div><strong>Gender:</strong> {applicant.gender}</div>
              <div><strong>Aadhaar:</strong> {applicant.adhar_number}</div>
              <div><strong>Category:</strong> {applicant.caste_category}</div>
            </div>
            
            <h4 style={{ marginTop: '24px', borderBottom: '1px solid var(--erp-border)', paddingBottom: '8px' }}>Addresses</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <strong>Permanent Address:</strong>
                <p style={{ margin: '4px 0 0' }}>{applicant.perm_area}, {applicant.perm_city}, {applicant.perm_district}, {applicant.perm_state} - {applicant.perm_pin}</p>
              </div>
              <div>
                <strong>Temporary Address:</strong>
                <p style={{ margin: '4px 0 0' }}>{applicant.temp_area}, {applicant.temp_city}, {applicant.temp_district}, {applicant.temp_state} - {applicant.temp_pin}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Parent Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Parent / Guardian Details</div>
          </div>
          <div className="erp-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>{parent.parent_relationship || 'Parent'} Name:</strong> {parent.name}</div>
              <div><strong>Mother Name:</strong> {parent.mother_name}</div>
              <div><strong>Mobile:</strong> {parent.mobile_number}</div>
              <div><strong>Occupation:</strong> {parent.occupation || 'N/A'}</div>
              <div><strong>Annual Income:</strong> ₹{parent.annual_income}</div>
            </div>
          </div>
        </section>

        {/* Education Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Education Details</div>
          </div>
          <div className="erp-card__body">
            <div className="erp-table-responsive">
              <table className="erp-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th>Qualification</th>
                    <th>Institution</th>
                    <th>Board/Univ</th>
                    <th>Pass Year</th>
                    <th>Marks</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map(edu => (
                    <tr key={edu.education_id}>
                      <td>{edu.last_qualification_level}</td>
                      <td>{edu.last_institution_college_name}</td>
                      <td>{edu.university_board}</td>
                      <td>{edu.passout_year}</td>
                      <td>{edu.obtained_marks} / {edu.total_marks}</td>
                      <td>{edu.percentage ? edu.percentage.toFixed(2) : '-'}%</td>
                    </tr>
                  ))}
                  {education.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No education records.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Enclosed Documents Checklist */}
        <section className="erp-card" style={{ pageBreakInside: 'avoid' }}>
          <div className="erp-card__header">
            <div className="erp-card__title">Enclosures / Uploaded Documents</div>
          </div>
          <div className="erp-card__body">
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                {(() => {
                  const allDocText = documents.map(d => `${d.document_type} ${d.document_name}`.toLowerCase()).join(' ');
                  
                  // Use broader matching to match backend self-healing logic
                  const hasAdhar = ["adhar", "aadhar", "identity", "id_proof"].some(x => allDocText.includes(x));
                  const hasPhoto = ["photo", "photograph", "image", "img", "pic"].some(x => allDocText.includes(x));
                  const hasSign = ["signature", "sign"].some(x => allDocText.includes(x));

                  return (
                    <>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <i className={`fa-solid ${hasAdhar ? 'fa-square-check erp-text-success' : 'fa-square-xmark erp-text-danger'}`}></i>
                         1. Aadhar Card / Identity Proof
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <i className={`fa-solid ${hasPhoto ? 'fa-square-check erp-text-success' : 'fa-square-xmark erp-text-danger'}`}></i>
                         2. Passport Photograph
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <i className={`fa-solid ${hasSign ? 'fa-square-check erp-text-success' : 'fa-square-xmark erp-text-danger'}`}></i>
                         3. Digital Signature
                      </li>
                      
                      {!(hasAdhar && hasPhoto && hasSign) && !isReadOnly && (
                        <div className="erp-alert erp-alert--warning" style={{ marginTop: '12px', fontSize: '13px' }}>
                          <i className="fa-solid fa-triangle-exclamation"></i> <strong>Mandatory files missing.</strong> Please go back to the Documents step and upload the required files.
                        </div>
                      )}
                    </>
                  );
                })()}
              </ul>
          </div>
        </section>

        {/* Applicant Declaration */}
        <section className="erp-card" style={{ pageBreakInside: 'avoid', border: '1px solid var(--erp-border)', background: 'transparent', boxShadow: 'none' }}>
           <div className="erp-card__body text-sm text-gray-700">
               <h4 style={{ margin: '0 0 12px 0' }}>Declaration</h4>
               <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>
                  I hereby declare that the information provided in this application is strictly true and accurate to the best of my knowledge. I understand that my admission is strictly provisional and may be cancelled if any of the attached documents or aforementioned details are found to be fraudulent.
               </p>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '64px' }}>
                   <div>
                       <div style={{ borderTop: '1px solid #111', paddingTop: '8px', width: '150px', textAlign: 'center' }}>Date</div>
                   </div>
                   <div>
                       <div style={{ borderTop: '1px solid #111', paddingTop: '8px', width: '150px', textAlign: 'center' }}>Signature of Applicant</div>
                   </div>
               </div>
           </div>
        </section>


        {/* Secondary Submit Button at the bottom */}
        {(!isReadOnly || global.status === 'revision_required') && !isSuccessfullySubmitted && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', marginBottom: '40px' }}>
            <button 
              className="erp-btn erp-btn--primary" 
              onClick={handleFinalSubmit} 
              disabled={submitting}
              style={{ 
                background: 'var(--erp-success)', 
                borderColor: 'var(--erp-success)',
                padding: '16px 48px',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)' 
              }}
            >
               <i className="fa-solid fa-paper-plane" style={{ marginRight: '10px' }}></i> 
               {submitting ? 'Submitting Application...' : 'Final Submit Application'}
            </button>
          </div>
        )}

        {(isReadOnly || isSuccessfullySubmitted) && global.status !== 'revision_required' && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', marginBottom: '40px' }}>
             <div className="erp-badge erp-badge--success" style={{ padding: '12px 24px', fontSize: '16px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                <i className="fa-solid fa-circle-check"></i> Application Successfully Submitted
             </div>
          </div>
        )}

      </div>
    </main>
  );
}
