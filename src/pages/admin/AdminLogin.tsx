import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Droplets } from 'lucide-react';

const ADMIN_PASSWORD = 'onewater2026';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('ow_admin', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full water-gradient flex items-center justify-center mx-auto mb-4">
          <Droplets className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-6">One Water Management</p>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full water-gradient text-primary-foreground font-semibold" onClick={handleLogin}>
            <Lock className="w-4 h-4 mr-2" /> Login
          </Button>
        </div>
      </div>
    </div>
  );
}
