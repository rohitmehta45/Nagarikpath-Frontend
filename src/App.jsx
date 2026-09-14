import { useEffect, useState } from 'react';
import './App.css';
import Certificate from './components/Certificate';
import DataBridge from './components/DataBridge';
import Profile from './components/Profile';
import { Header, Footer } from './components/Shared';
import {
  Home,
  Services,
  ServiceDetail,
  Eligibility,
  Apply,
  Checklist,
  Track,
  Offices,
  Faq,
  Notices,
  About,
  MessageForm
} from './components/PublicPages';
import { Login, Register } from './components/AuthPages';
import { ProtectedCitizenDashboard } from './components/CitizenDashboard';
import { ProtectedAdminDashboard } from './components/AdminDashboard';
import { go } from './utils/go';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [lang, setLang] = useState('EN');
  const [menu, setMenu] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('databridge_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleNavigation = () => {
      setPath(window.location.pathname);
      setMenu(false);

      try {
        const stored = localStorage.getItem('databridge_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const login = loggedInUser => {
    setUser(loggedInUser);

    try {
      localStorage.setItem(
        'databridge_user',
        JSON.stringify(loggedInUser)
      );
    } catch {
      // Ignore storage errors
    }

    setMenu(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem('databridge_token');
      localStorage.removeItem('databridge_user');
    } catch {
      // Ignore storage errors
    }

    setUser(null);
    setMenu(false);
    go('/');
  };

  let view;

  if (path === '/') {
    if (user?.role === 'CITIZEN') {
      view = (
        <ProtectedCitizenDashboard
          user={user}
          onLogout={logout}
        />
      );
    } else {
      view = <Home />;
    }
  } else if (path === '/services') {
    view = <Services />;
  } else if (path.startsWith('/services/')) {
    view = <ServiceDetail id={path.split('/').pop()} />;
  } else if (path === '/eligibility') {
    view = <Eligibility />;
  } else if (path === '/apply') {
    view = <Apply />;
  } else if (path === '/checklist') {
    view = <Checklist />;
  } else if (path === '/track') {
    view = <Track />;
  } else if (path === '/offices') {
    view = <Offices />;
  } else if (path === '/faq') {
    view = <Faq />;
  } else if (path === '/notices') {
    view = <Notices />;
  } else if (path === '/feedback') {
    view = <MessageForm kind="feedback" />;
  } else if (path === '/complaints') {
    view = <MessageForm kind="complaints" />;
  } else if (path === '/about') {
    view = <About />;
  } else if (path === '/citizen/dashboard') {
    view = (
      <ProtectedCitizenDashboard
        user={user}
        onLogout={logout}
      />
    );
  } else if (path.startsWith('/certificate/')) {
    view = <Certificate id={path.split('/').pop()} />;
  } else if (path === '/profile') {
    view = <Profile />;
  } else if (path === '/admin/dashboard') {
    view = (
      <ProtectedAdminDashboard
        user={user}
        onLogout={logout}
      />
    );
  } else if (path === '/register') {
    view = <Register onLogin={login} />;
  } else if (path === '/login') {
    view = <Login onLogin={login} />;
  } else if (path === '/databridge') {
    if (user?.role === 'ADMIN') {
      view = (
        <ProtectedAdminDashboard
          user={user}
          onLogout={logout}
        />
      );
    } else if (user?.role === 'OFFICER') {
      view = <DataBridge user={user} />;
    } else {
      view = <Login onLogin={login} />;
    }
  } else {
    view = <Login onLogin={login} />;
  }

  const isAdminWorkspace =
    path === '/admin/dashboard' ||
    (path === '/databridge' && user?.role === 'ADMIN');

  const isOfficerWorkspace =
    path === '/databridge' && user?.role === 'OFFICER';

  const isRoleWorkspace =
    isAdminWorkspace || isOfficerWorkspace;

  return (
    <>
      {!isRoleWorkspace && (
        <Header
          lang={lang}
          setLang={setLang}
          menu={menu}
          setMenu={setMenu}
          user={user}
          onLogout={logout}
        />
      )}

      {view}

      {!isRoleWorkspace && <Footer />}
    </>
  );
}