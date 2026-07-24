import { useEffect, useState } from 'react';
import { Bell, Mail, Megaphone, Calendar } from 'lucide-react';

export function MemberNotifications() {
  const [data, setData] = useState<{ announcements: any[]; emails: any[] }>({ announcements: [], emails: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ANNOUNCEMENTS' | 'ALERTS'>('ALL');

  useEffect(() => {
    fetch('/api/members/notifications')
      .then(res => res.json())
      .then(d => {
        setData({ announcements: d.announcements || [], emails: d.emails || [] });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Notifications & Announcements</h1>
        <p className="text-ink-600 mt-1">Stay updated on cooperative announcements and personal activity notifications.</p>
      </header>

      <div className="flex gap-2 border-b border-ink-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${activeTab === 'ALL' ? 'bg-seed-800 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${activeTab === 'ANNOUNCEMENTS' ? 'bg-seed-800 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
        >
          Cooperative Announcements ({data.announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${activeTab === 'ALERTS' ? 'bg-seed-800 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
        >
          Email Notifications ({data.emails.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-ink-500 bg-white rounded-[14px] border border-ink-200">Loading notifications...</div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'ALL' || activeTab === 'ANNOUNCEMENTS') && data.announcements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-seed-800 uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-seed-600" /> Cooperative Announcements
              </h3>
              {data.announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-5 rounded-[12px] border border-ink-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-seed-950 text-base">{ann.title}</h4>
                    <span className="text-xs text-ink-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.publishedAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'ALL' || activeTab === 'ALERTS') && data.emails.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-seed-800 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-seed-600" /> Account Notifications
              </h3>
              {data.emails.map((email) => {
                let parsedPayload: any = {};
                try {
                  parsedPayload = JSON.parse(email.payload || '{}');
                } catch (e) {}

                return (
                  <div key={email.id} className="bg-white p-5 rounded-[12px] border border-ink-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-seed-600" />
                        <h4 className="font-semibold text-seed-950 text-sm">{email.subject}</h4>
                      </div>
                      <span className="text-xs text-ink-500 font-mono">
                        {new Date(email.sentAt * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-ink-600 bg-ivory-50 p-2.5 rounded-[6px] border border-ink-100 font-mono">
                      Template: {email.template} {parsedPayload.membershipNumber ? `• ID: ${parsedPayload.membershipNumber}` : ''} {parsedPayload.amount ? `• ₦${(parsedPayload.amount / 100).toLocaleString()}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data.announcements.length === 0 && data.emails.length === 0 && (
            <div className="bg-white rounded-[14px] border border-ink-200 shadow-sm p-16 text-center text-ink-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-ink-300" />
              <p>You have no new notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
