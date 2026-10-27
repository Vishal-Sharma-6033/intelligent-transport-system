import React, { useState } from 'react';
import { X, Shield, User, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'passenger'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.auth.register(formData);
      } else {
        res = await api.auth.login({
          email: formData.email,
          password: formData.password
        });
      }

      if (res.data?.token) {
        localStorage.setItem('transit_token', res.data.token);
        localStorage.setItem('transit_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setError(null);
    setLoading(true);
    try {
      const creds =
        role === 'admin'
          ? { email: 'admin@transit.ai', password: 'Admin@123' }
          : { email: 'passenger@transit.ai', password: 'Pass@123' };

      const res = await api.auth.login(creds);
      if (res.data?.token) {
        localStorage.setItem('transit_token', res.data.token);
        localStorage.setItem('transit_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-6 text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
            {isRegister ? <Sparkles className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {isRegister ? 'Create Transit Account' : 'Sign In to TRANSIT.AI'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? 'Register to plan routes & manage transport network'
              : 'Sign in to access personalized journey schedules & admin panel'}
          </p>
        </div>

        {/* Quick 1-Click Demo Buttons */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5">
          <p className="text-[11px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant 1-Click Demo Logins</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('passenger')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Passenger Demo</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">Or enter credentials</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 my-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Yash Saini"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'passenger' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer ${
                    formData.role === 'passenger'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer ${
                    formData.role === 'admin'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Admin / Operator
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-bold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-bold ml-1 cursor-pointer"
              >
                Register Now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
