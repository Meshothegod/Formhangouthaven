import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, LogOut, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Application = Database['public']['Tables']['staff_applications']['Row'];
type StaffMember = Database['public']['Tables']['staff_members']['Row'];

interface StaffDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function StaffDashboard({ onBack, onLogout }: StaffDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingStaff, setPendingStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'staff'>('applications');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsResult, staffResult] = await Promise.all([
        supabase
          .from('staff_applications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('staff_members')
          .select('*')
          .eq('approved', false)
          .order('created_at', { ascending: false })
      ]);

      if (appsResult.error) throw appsResult.error;
      if (staffResult.error) throw staffResult.error;

      setApplications(appsResult.data || []);
      setPendingStaff(staffResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('staff_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setApplications(prev =>
        prev.map(app =>
          app.id === id
            ? { ...app, status, reviewed_at: new Date().toISOString() }
            : app
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const approveStaffMember = async (staffId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentStaff } = await supabase
        .from('staff_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!currentStaff) throw new Error('Current staff member not found');

      const { error: updateError } = await supabase
        .from('staff_members')
        .update({
          approved: true,
          approved_by: currentStaff.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', staffId);

      if (updateError) throw updateError;

      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve staff member');
    }
  };

  const rejectStaffMember = async (staffId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staffId);

      if (deleteError) throw deleteError;

      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject staff member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
          <p className="text-gray-400 mb-8">Review and manage staff applications and members</p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'applications'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Applications
              {activeTab === 'applications' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'staff'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Pending Staff</span>
                {pendingStaff.length > 0 && (
                  <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingStaff.length}
                  </span>
                )}
              </div>
              {activeTab === 'staff' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
          </div>

          {activeTab === 'applications' && (
            <>
              <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pending ({applications.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Approved ({applications.filter(a => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No applications found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  className="bg-gray-700 rounded-lg p-6 border border-gray-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{app.discord_username}</h3>
                      <p className="text-gray-400 text-sm">ID: {app.discord_id}</p>
                      <p className="text-gray-400 text-sm">
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="font-medium capitalize">{app.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Age</p>
                      <p className="font-medium">{app.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Timezone</p>
                      <p className="font-medium">{app.timezone}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Previous Experience</p>
                      <p className="text-gray-200">{app.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Why Join</p>
                      <p className="text-gray-200">{app.why_join}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Availability</p>
                      <p className="text-gray-200">{app.availability}</p>
                    </div>
                    {app.additional_info && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Additional Info</p>
                        <p className="text-gray-200">{app.additional_info}</p>
                      </div>
                    )}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-600">
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </>
          )}

          {activeTab === 'staff' && (
            <>
              {pendingStaff.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No pending staff registrations
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStaff.map(staff => (
                    <div
                      key={staff.id}
                      className="bg-gray-700 rounded-lg p-6 border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{staff.discord_username}</h3>
                          <p className="text-gray-400 text-sm">
                            Requested: {new Date(staff.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Role: {staff.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400">
                          <UserPlus className="w-5 h-5" />
                          <span className="font-medium">Pending Approval</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-600">
                        <button
                          onClick={() => approveStaffMember(staff.id)}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve Staff Member
                        </button>
                        <button
                          onClick={() => rejectStaffMember(staff.id)}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
