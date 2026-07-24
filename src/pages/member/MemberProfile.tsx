import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Phone, Mail, ShieldCheck, Save } from 'lucide-react';

export function MemberProfile() {
  const { member, refreshMember } = useOutletContext<{ member: any; refreshMember?: () => void }>();
  const [phoneNumber, setPhoneNumber] = useState(member?.phoneNumber || '');
  const [firstName, setFirstName] = useState(member?.firstName || '');
  const [lastName, setLastName] = useState(member?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (member) {
      setPhoneNumber(member.phoneNumber || '');
      setFirstName(member.firstName || '');
      setLastName(member.lastName || '');
    }
  }, [member]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/members/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, firstName, lastName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully.');
        if (refreshMember) refreshMember();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!member) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Profile Settings</h1>
        <p className="text-ink-600 mt-1">Manage your personal information and cooperative member credentials.</p>
      </header>

      <div className="bg-white rounded-[14px] border border-ink-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-6 border-b border-ink-100 pb-6">
          <div className="w-20 h-20 rounded-full bg-seed-100 text-seed-800 flex items-center justify-center text-2xl font-bold shadow-inner">
            {member.firstName?.[0]}{member.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-seed-950">{member.firstName} {member.lastName}</h2>
            <p className="text-ink-600 font-medium mt-1">Member ID: <span className="font-mono text-seed-800 font-semibold">{member.membershipNumber}</span></p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Member
              </span>
              <span className="text-xs text-ink-500">Joined {new Date(member.joinedAt * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <h3 className="text-lg font-semibold text-seed-950 flex items-center gap-2">
            <User className="w-5 h-5 text-seed-700" /> Contact & Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Membership ID</label>
              <input 
                type="text" 
                value={member.membershipNumber} 
                disabled 
                className="w-full px-3.5 py-2 border border-ink-200 rounded-[8px] bg-ink-50 text-ink-500 font-mono text-sm cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-ink-500" /> Phone Number
              </label>
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-ink-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="bg-seed-800 text-white px-6 py-2.5 rounded-[8px] font-medium hover:bg-seed-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
