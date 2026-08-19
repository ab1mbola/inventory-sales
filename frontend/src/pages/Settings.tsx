import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Building2, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  useCompanySettings, 
  useUpdateCompany, 
  useUpdateProfile, 
  useUpdatePassword 
} from '../hooks/useSettings';
import FullPageLoader from '../components/FullPageLoader';


export default function Settings() {
  const { user } = useAuth();
  const isOwnerOrManager = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');

  // State for forms
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [copyrightText, setCopyrightText] = useState('');

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Queries & Mutations
  const { data: companyData, isLoading: loadingCompany } = useCompanySettings(isOwnerOrManager);
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const updateCompany = useUpdateCompany();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (companyData) {
      setCompanyName(companyData.name);
      setCompanyLogo(companyData.logo);
      setCopyrightText(companyData.copyrightText || '');
    }
  }, [companyData]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name: profileName, email: profileEmail });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    try {
      await updatePassword.mutateAsync({ oldPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompany.mutateAsync({ 
        name: companyName, 
        logo: companyLogo, 
        copyrightText 
      });
      showToast('Company settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update company settings', 'error');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      showToast('File size must be less than 1MB', 'error');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid format. Use PNG, JPG, JPEG, or SVG', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] flex items-center gap-4 px-6 py-4 rounded-xl border-2 shadow-2xl animate-in slide-in-from-right duration-500 ${
          toast.type === 'success' ? 'bg-success border-success text-white' : 'bg-accent border-accent text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} className="text-white" /> : <AlertCircle size={18} className="text-white" />}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      )}

      <header className="border-b border-border pb-6">
        <h1 className="text-2xl lg:text-3xl font-sans font-black tracking-tighter uppercase leading-none">Settings</h1>
        <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.3em] font-bold">App Preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Nav (Desktop) */}
        <aside className="lg:col-span-3 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 transition-all border cursor-pointer ${
              activeTab === 'profile' ? 'border-accent bg-accent-soft text-accent rounded-xl shadow-sm' : 'border-border text-muted hover:border-accent hover:text-primary rounded-xl'
            }`}
          >
            <User size={14} />
            <span>Profile Settings</span>
          </button>
          {isOwnerOrManager && (
            <button 
              onClick={() => setActiveTab('company')}
              className={`w-full text-left px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 transition-all border cursor-pointer ${
                activeTab === 'company' ? 'border-accent bg-accent-soft text-accent rounded-xl shadow-sm' : 'border-border text-muted hover:border-accent hover:text-primary rounded-xl'
              }`}
            >
              <Building2 size={14} />
              <span>Company Settings</span>
            </button>
          )}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-12">
          
          {activeTab === 'profile' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Section */}
              <section className="tag-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-surface/30">
                  <User size={16} className="text-accent" />
                  <h2 className="font-sans text-lg font-black">Profile</h2>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Email Address</label>
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="tag-btn flex items-center gap-3 text-[10px] disabled:opacity-30 cursor-pointer"
                    >
                      {updateProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Settings
                    </button>
                  </div>
                </form>
              </section>

              {/* Password Section */}
              <section className="tag-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-surface/30">
                  <Lock size={16} className="text-accent" />
                  <h2 className="font-sans text-lg font-black">Security</h2>
                </div>
                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showOldPassword ? "text" : "password"} 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="w-full pl-4 pr-12 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 hover:text-black transition-colors"
                      >
                        {showOldPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full pl-4 pr-12 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 hover:text-black transition-colors"
                        >
                          {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full pl-4 pr-12 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 hover:text-black transition-colors"
                        >
                          {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={updatePassword.isPending}
                      className="px-6 py-3 bg-white border border-black text-black hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-30"
                    >
                      {updatePassword.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                      Update Password
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {activeTab === 'company' && isOwnerOrManager && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="tag-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-surface/30">
                  <Building2 size={16} className="text-accent" />
                  <h2 className="font-sans text-lg font-black">Company Details</h2>
                </div>
                {loadingCompany ? (
                  <FullPageLoader message="Loading Company Data..." />
                ) : (

                  <form onSubmit={handleCompanySubmit} className="p-6 space-y-8">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                      {/* Logo Upload */}
                      <div className="space-y-4 shrink-0">
                        <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] block">Company Logo</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-32 h-32 border border-border bg-white rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent group relative transition-all"
                        >
                          {companyLogo ? (
                            <>
                              <img src={companyLogo} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                                <Upload className="text-white" size={18} />
                                <span className="text-[8px] text-white font-bold uppercase tracking-widest">Replace</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="text-muted/30 group-hover:text-accent transition-colors" size={24} />
                              <span className="text-[9px] font-bold text-muted/50 group-hover:text-accent uppercase tracking-widest">Upload</span>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          className="hidden" 
                          accept=".png,.jpg,.jpeg,.svg"
                        />
                        <p className="text-[9px] text-muted max-w-[160px] text-center uppercase tracking-tighter">PNG / JPG / SVG — MAX 1.0MB</p>
                      </div>

                      <div className="flex-1 space-y-8 w-full">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Company Name</label>
                          <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Copyright Text</label>
                          <input 
                            type="text" 
                            placeholder="e.g. © 2024 Your Corporate Entity"
                            value={copyrightText}
                            onChange={(e) => setCopyrightText(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:border-accent focus:ring-4 focus:ring-accent-soft outline-none transition-all text-xs tracking-wider"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border flex justify-end">
                      <button 
                        type="submit"
                        disabled={updateCompany.isPending}
                        className="tag-btn flex items-center gap-3 text-[10px] disabled:opacity-30 cursor-pointer"
                      >
                        {updateCompany.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Company Settings
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
