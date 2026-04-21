import { useState } from 'react';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || '';
import { Input } from '@/components/ui/input';
import { Lock, Droplets, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      // Store JWT token and admin info in localStorage
      localStorage.setItem('ow_admin_token', data.token);
      localStorage.setItem('ow_admin_user', data.admin.username);
      onLogin();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full water-gradient flex items-center justify-center mx-auto mb-4">
          <Droplets className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-6">OneWater Pakistan Management</p>

        <div className="space-y-3 text-left">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="current-password"
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            className="w-full water-gradient text-primary-foreground font-semibold"
            onClick={handleLogin}
            disabled={isLoading}
          >
            <Lock className="w-4 h-4 mr-2" />
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          OneWater Pakistan © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
