import { useEffect, useState } from 'react';
import { adminToken, ADMIN_LOGOUT_EVENT } from '@/lib/api';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => !!adminToken.get());
  const [notice, setNotice] = useState('');

  // Keep the admin area out of search engines while it is mounted.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  // Any admin call returning 401 (expired / revoked token) lands here.
  useEffect(() => {
    const onExpired = () => {
      setLoggedIn(false);
      setNotice('Your session has expired. Please log in again.');
    };
    window.addEventListener(ADMIN_LOGOUT_EVENT, onExpired);
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onExpired);
  }, []);

  const logout = (message = '') => {
    adminToken.clear();
    setNotice(message);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <AdminLogin notice={notice} onLogin={() => { setNotice(''); setLoggedIn(true); }} />;
  }
  return <AdminPanel onLogout={logout} />;
}
