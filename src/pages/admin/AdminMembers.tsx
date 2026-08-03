import { useEffect, useState } from 'react';
import { Users, Search, UserCheck, UserX, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMembers = () => {
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data.members || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdatingId(memberId);
    try {
      const res = await fetch(`/api/admin/members/${memberId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Member status updated to ${newStatus}`);
        fetchMembers();
      } else {
        toast.error(data.error || 'Failed to update member status');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    const memNo = (m.membershipNumber || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    const phone = (m.phoneNumber || '').toLowerCase();
    return name.includes(q) || memNo.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-seed-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-seed-800" /> Members Directory
          </h1>
          <p className="text-ink-600 mt-1">Manage cooperative members, profiles, and account statuses.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2.5 rounded-[10px] border border-ink-200 text-xs font-semibold text-seed-900 shadow-xs">
            Total Members: <span className="font-bold text-seed-950 text-sm font-mono">{members.length}</span>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[14px] border border-ink-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-ink-200 bg-ink-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name, ID, phone, email..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none bg-white" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-500">Loading members directory...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm divide-y divide-ink-100">
              <thead className="bg-ink-50/70 text-ink-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5 text-right">Deposit Wallet</th>
                  <th className="px-6 py-3.5 text-right">Savings / Thrift</th>
                  <th className="px-6 py-3.5 text-right">Share Capital</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-ink-500">
                      No matching members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-seed-100 text-seed-800 font-bold flex items-center justify-center text-sm shadow-xs">
                            {m.firstName?.[0]}{m.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-seed-950">{m.firstName} {m.lastName}</div>
                            <div className="text-xs font-mono text-seed-700 font-semibold">{m.membershipNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-ink-800">{m.email}</div>
                        <div className="text-xs text-ink-500 font-mono mt-0.5">{m.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-seed-900 bg-seed-50/40">
                        ₦{((m.depositBalanceKobo || 0) / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-seed-950">
                        ₦{(m.totalContributionsKobo / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-seed-950">
                        ₦{((m.sharesBalanceKobo || 0) / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'ACTIVE' 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-danger/10 text-danger border border-danger/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(m.id, m.status)}
                          disabled={updatingId === m.id}
                          className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors border disabled:opacity-50 inline-flex items-center gap-1.5 ${
                            m.status === 'ACTIVE'
                              ? 'bg-white border-danger/30 text-danger hover:bg-danger/5'
                              : 'bg-white border-success/30 text-success hover:bg-success/5'
                          }`}
                        >
                          {m.status === 'ACTIVE' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
