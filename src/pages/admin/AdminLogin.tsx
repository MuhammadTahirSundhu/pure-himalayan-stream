import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Droplets, AlertCircle, Info } from 'lucide-react';
import { api, adminToken } from '@/lib/api';
import { errMsg } from './ui';

interface AdminLoginProps {
  onLogin: () => void;
  notice?: string;
}

export default function AdminLogin({ onLogin, notice }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await api<{ token: string }>('/api/admin/login', { method: 'POST', json: { username, password } });
      adminToken.set(data.token);
      onLogin();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full water-gradient flex items-center justify-center mx-auto mb-4">
          <Droplets className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-6">OneWater Pakistan Management</p>

        {notice && (
          <div className="flex items-center gap-2 text-left text-xs text-primary bg-primary/10 rounded-lg p-3 mb-4">
            <Info className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <form className="space-y-3 text-left" onSubmit={handleLogin}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            autoComplete="current-password"
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" className="w-full water-gradient text-primary-foreground font-semibold" disabled={isLoading}>
            <Lock className="w-4 h-4 mr-2" />
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6">
          OneWater Pakistan © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
