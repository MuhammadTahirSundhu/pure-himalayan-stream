import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('ow_admin') === 'true');

  const handleLogout = () => {
    localStorage.removeItem('ow_admin');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
