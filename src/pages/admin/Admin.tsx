import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function Admin() {
  // Check for JWT token instead of the old plaintext boolean flag
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem('ow_admin_token')
  );

  const handleLogout = () => {
    localStorage.removeItem('ow_admin_token');
    localStorage.removeItem('ow_admin_user');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
