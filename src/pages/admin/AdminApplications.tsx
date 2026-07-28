import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { can } from '../../lib/roles';

export function AdminApplications() {
  const { user } = useOutletContext<{ user: any }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchApplications = () => {
    fetch('/api/admin/applications').then(res => res.json()).then(data => {
      const apps = data.applications || [];
      setApplications(apps);
      if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Application approved! Member ${data.member.membershipNumber} created.`);
        setSelectedApp(null);
        fetchApplications();
      } else {
        toast.error(data.error || 'Failed to approve');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-seed-950">Membership Applications</h1>
          <p className="text-ink-600 mt-1">Review and approve new member registrations.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-ink-200 bg-ink-50">
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-[6px] outline-none focus:border-seed-500 focus:ring-1 focus:ring-seed-500"
            />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-ink-500 text-sm">No applications found.</div>
            ) : (
              applications.map(app => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 cursor-pointer hover:bg-ivory-50 transition-colors ${selectedApp?.id === app.id ? 'bg-seed-50 border-l-4 border-seed-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-seed-950 text-sm">{app.firstName} {app.lastName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-xs text-ink-600 font-mono">{app.reference}</div>
                  <div className="text-xs text-ink-500 mt-2">{new Date(app.submittedAt * 1000).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-ink-200 bg-ink-50 flex justify-between items-center">
                <h3 className="font-semibold text-seed-950">Application Details</h3>
                <span className="text-sm font-mono text-ink-600">{selectedApp.reference}</span>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                <section>
                  <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Applicant Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Full Name</p>
                      <p className="font-medium">{selectedApp.firstName} {selectedApp.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Email</p>
                      <p className="font-medium">{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Phone Number</p>
                      <p className="font-medium">{selectedApp.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Employment</p>
                      <p className="font-medium">{selectedApp.employment}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Attached Documents</h4>
                  <div className="p-3 border border-ink-200 rounded-[8px] flex justify-between items-center bg-ivory-50">
                    <span className="text-sm font-medium">national-id.pdf</span>
                    <span className="text-xs text-ink-500 px-2 py-1 bg-ink-100 rounded">ID document</span>
                  </div>
                </section>
              </div>

              {selectedApp.status === 'PENDING' && can(user.role, 'applications:write') && (
                <div className="px-6 py-4 border-t border-ink-200 bg-ivory-50 flex justify-end gap-3">
                  <button type="button" className="px-4 py-2 text-sm font-medium text-danger bg-white border border-danger/20 rounded-[8px] hover:bg-danger/5 transition-colors">
                    Reject application
                  </button>
                  <button 
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="px-6 py-2 text-sm font-medium text-white bg-seed-800 rounded-[8px] hover:bg-seed-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isApproving ? 'Approving…' : 'Approve & create member'}
                  </button>
                </div>
              )}
              {selectedApp.status === 'PENDING' && !can(user.role, 'applications:write') && (
                <div className="px-6 py-3 border-t border-ink-200 bg-ink-50 text-xs text-ink-600">
                  Only Super Admin or Admin can approve membership applications.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-ink-200 rounded-[10px] text-ink-500">
              Select an application to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
