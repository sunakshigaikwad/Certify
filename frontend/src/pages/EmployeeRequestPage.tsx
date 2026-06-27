import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { FileUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeRequestPageProps {
  user: any;
  onLogout: () => void;
}

export const EmployeeRequestPage: React.FC<EmployeeRequestPageProps> = ({ user, onLogout }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('skillsRequested', data.skillsRequested);
    formData.append('duration', data.duration);
    formData.append('attendance', data.attendance);

    if (data.resume && data.resume[0]) {
      formData.append('resume', data.resume[0]);
    }
    if (data.experienceLetter && data.experienceLetter[0]) {
      formData.append('experienceLetter', data.experienceLetter[0]);
    }
    if (data.aadhaar && data.aadhaar[0]) {
      formData.append('aadhaar', data.aadhaar[0]);
    }

    if (data.supportingDocs) {
      for (let i = 0; i < data.supportingDocs.length; i++) {
        formData.append('supportingDocs', data.supportingDocs[i]);
      }
    }

    try {
      await axios.post('http://localhost:5000/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccessMsg('Request submitted successfully! Redirecting to tracker...');
      reset();
      setTimeout(() => {
        navigate('/employee-track');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request. Please check files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Submit Request" user={user} />

        <main className="p-8 max-w-3xl">
          <p className="text-xs text-gray-500 mb-6">Request experience validation. Provide details and upload supporting documents.</p>

          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-800 flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded p-4 text-red-800 flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">Certificate Request Form</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills Requested (Comma Separated)</label>
                  <input
                    type="text"
                    {...register('skillsRequested', { required: 'Provide at least one skill' })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    placeholder="e.g. react, python, node.js, management"
                  />
                  {errors.skillsRequested && <p className="mt-1 text-xs text-red-600">{errors.skillsRequested.message as string}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Tenure Duration</label>
                  <input
                    type="text"
                    {...register('duration', { required: 'Provide tenure duration' })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    placeholder="e.g. jan 2023 - dec 2025"
                  />
                  {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration.message as string}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Overall Attendance %</label>
                  <input
                    type="number"
                    {...register('attendance', { required: 'Provide overall attendance rate', min: 0, max: 100 })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    placeholder="e.g. 83"
                  />
                  {errors.attendance && <p className="mt-1 text-xs text-red-600">{errors.attendance.message as string}</p>}
                </div>
              </div>

              {/* Uploads Section */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-sm text-gray-800">Documents Upload (PDF / Image)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Resume</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      {...register('resume', { required: 'Resume is required' })}
                      className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {errors.resume && <p className="mt-1 text-xs text-red-600">{errors.resume.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience Letter</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      {...register('experienceLetter', { required: 'Experience letter is required' })}
                      className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {errors.experienceLetter && <p className="mt-1 text-xs text-red-600">{errors.experienceLetter.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Aadhaar Card Proof</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      {...register('aadhaar', { required: 'Aadhaar copy is required' })}
                      className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {errors.aadhaar && <p className="mt-1 text-xs text-red-600">{errors.aadhaar.message as string}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Supporting Documents (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    {...register('supportingDocs')}
                    className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="emerald-btn-primary py-2.5 px-6"
                >
                  {loading ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
