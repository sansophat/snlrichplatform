import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { SnlLogo } from './SnlLogo';
import { RegisteredUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: RegisteredUser) => void;
  onRegisterSuccess: (newUser: RegisteredUser) => void;
  initialMode?: 'login' | 'register';
  registeredUsers: RegisteredUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  initialMode = 'login',
  registeredUsers,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = email.trim();

    // Specific Admin Credentials requested: user: admin / pass: Editor99$$
    if (
      cleanInput.toLowerCase() === 'admin' ||
      cleanInput.toLowerCase() === 'admin@snlrich.com'
    ) {
      if (password === 'Editor99$$') {
        const adminUser = registeredUsers.find((u) => u.role === 'admin') || {
          id: 'usr_admin',
          name: 'SNL System Admin',
          email: 'admin@snlrich.com',
          role: 'admin' as const,
          joinedDate: '2023-01-01',
          pointsBalance: 50000,
          cashbackBalance: 1250.0,
          referralCode: 'SNL-ADMIN-01',
          status: 'active' as const,
          tier: 'Platinum' as const,
        };
        onLoginSuccess(adminUser);
        onClose();
        return;
      } else {
        setErrorMsg('Invalid administrator credentials.');
        return;
      }
    }

    // Normal User / Merchant Login
    const user = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanInput.toLowerCase() ||
        u.name.toLowerCase() === cleanInput.toLowerCase()
    );

    if (user) {
      if (user.status === 'suspended') {
        setErrorMsg('This account has been suspended by the platform administrator.');
        return;
      }
      onLoginSuccess(user);
      onClose();
    } else {
      // If new customer signs in, automatically create active customer profile
      const newUser: RegisteredUser = {
        id: `usr_${Date.now()}`,
        name: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@client.snlrich.com`,
        role: 'customer',
        joinedDate: new Date().toISOString().split('T')[0],
        pointsBalance: 200,
        cashbackBalance: 0,
        referralCode: `SNL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        status: 'active',
        tier: 'Bronze',
      };
      onLoginSuccess(newUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      setErrorMsg('An account with this email already exists. Please sign in.');
      return;
    }

    // "For merchant only admin can create it but guess can register as user or customers"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanName = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'RICH';
    const newRefCode = `SNL-${cleanName}-${randomSuffix}`;

    const newCustomer: RegisteredUser = {
      id: `usr_${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      role: 'customer', // strictly customer registration
      joinedDate: new Date().toISOString().split('T')[0],
      pointsBalance: 200, // Welcome gift 200 pts
      cashbackBalance: 0,
      referralCode: newRefCode,
      referredBy: referralCodeInput ? referralCodeInput.trim() : undefined,
      status: 'active',
      tier: 'Bronze',
    };

    onRegisterSuccess(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header with SNL Logo */}
        <div className="bg-[#0B1B3D] text-white p-6 relative flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <SnlLogo size="md" variant="light" showTagline={false} />
          <h2 className="text-base font-bold font-display mt-3">
            {mode === 'login' ? 'Sign In to SNL RICH' : 'Create Free Customer Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {mode === 'login'
              ? 'Access your rewards, cashback wallet, and referral link'
              : 'Earn 200 welcome points & instant cashback on every order'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              mode === 'login'
                ? 'border-[#0B1B3D] text-[#0B1B3D] bg-slate-50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              mode === 'register'
                ? 'border-[#0B1B3D] text-[#0B1B3D] bg-slate-50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Customer Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or username"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </form>
          ) : (
            /* Customer Registration Form */
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
                <span className="font-bold block">Customer Account Registration</span>
                <span className="text-slate-600">
                  Merchants are exclusively created and verified by Platform Administration.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sophat San"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. you@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Referred by Friend? (Optional)
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    placeholder="Enter referral code (e.g. SNL-RICH-8899)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Create Customer Account & Claim +200 pts</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
