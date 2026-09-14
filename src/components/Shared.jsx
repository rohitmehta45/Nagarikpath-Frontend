import { useEffect, useRef, useState } from 'react';
import { navigation } from '../data/siteData';
import { go, getInitials } from '../utils/go';

/* ---------------------------- Header ---------------------------- */

export function Header({
  lang,
  setLang,
  menu,
  setMenu,
  user,
  onLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem('databridge_avatar') || '';
    } catch {
      return '';
    }
  });

  const fileInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  const currentPath = window.location.pathname;

  const isActive = target => {
    if (target === '/') return currentPath === '/';
    if (target === '/services') {
      return (
        currentPath === '/services' ||
        currentPath.startsWith('/services/')
      );
    }
    return currentPath === target;
  };

  const navigate = path => {
    setProfileOpen(false);
    setMenu(false);
    go(path);
  };

  const logout = () => {
    setProfileOpen(false);
    setMenu(false);
    onLogout();
  };

  const handleFileChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatar(dataUrl);
      try {
        localStorage.setItem('databridge_avatar', dataUrl);
      } catch {
        /* ignore */
      }
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  /* Close the profile dropdown on outside click or Escape */
  useEffect(() => {
    if (!profileOpen) return undefined;

    const handlePointerDown = event => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <>
      <div className="prototype">
        <span>Academic E-Governance Prototype</span>
        <span>
          Not a legal issuance authority ·{' '}
          <button
            type="button"
            onClick={() => setLang(lang === 'EN' ? 'नेपाली' : 'EN')}
          >
            {lang === 'EN' ? 'नेपाली' : 'English'}
          </button>
        </span>
      </div>

      <header className="citizen-header">
        <button
          className="brand"
          type="button"
          onClick={() => navigate('/')}
          aria-label="Go to NagarikPath home"
        >
          <i>नि</i>
          <span>
            Nagarik<span>Path</span>
            <small>Digital Citizenship Service Platform</small>
          </span>
        </button>

        <nav
          className={`citizen-nav ${menu ? 'open' : ''}`}
          aria-label="Citizen navigation"
        >
          <div className="citizen-nav-inner">
            {navigation.map(([label, path]) => (
              <button
                type="button"
                key={path}
                className={isActive(path) ? 'active' : ''}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="head-actions">
          {user?.role === 'CITIZEN' ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="avatar-button"
                onClick={() => {
                  setProfileOpen(value => !value);
                  setMenu(false);
                }}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="avatar-image"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-summary">
                    <span className="profile-avatar">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="avatar-image"
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </span>

                    <span>
                      <b>{user.name}</b>
                      <small>{user.email}</small>
                      <em>Citizen</em>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="avatar-upload"
                    onClick={openFilePicker}
                  >
                    <span>⤒</span>
                    Upload picture
                  </button>

                  <div className="profile-divider" />

                  <button type="button" onClick={() => navigate('/profile')}>
                    <span>◉</span> My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/profile?edit=1')}
                  >
                    <span>✎</span> Edit profile
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/citizen/dashboard')}
                  >
                    <span>⌂</span> My Dashboard
                  </button>
                  <button type="button" onClick={() => navigate('/checklist')}>
                    <span>▣</span> My Documents
                  </button>
                  <button type="button" onClick={() => navigate('/track')}>
                    <span>↗</span> Track Application
                  </button>
                  <button type="button" onClick={() => navigate('/faq')}>
                    <span>?</span> Help &amp; Support
                  </button>

                  <div className="profile-divider" />

                  <button
                    type="button"
                    className="logout-item"
                    onClick={logout}
                  >
                    <span>⇥</span> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login"
              type="button"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          )}

          <button
            className="btn small header-cta"
            type="button"
            onClick={() => navigate('/apply')}
          >
            Start service <b>→</b>
          </button>

          <button
            className="mobile-menu"
            type="button"
            onClick={() => {
              setMenu(value => !value);
              setProfileOpen(false);
            }}
            aria-label="Toggle navigation"
            aria-expanded={menu}
          >
            {menu ? '×' : '☰'}
          </button>
        </div>
      </header>
    </>
  );
}

/* ---------------------------- Footer ---------------------------- */

export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            Nagarik<span>Path</span>
          </div>
          <p>Clear guidance for Nepal citizenship service journeys.</p>
        </div>

        <div>
          <b>Explore</b>
          <button type="button" onClick={() => go('/services')}>
            Citizenship services
          </button>
          <button type="button" onClick={() => go('/eligibility')}>
            Eligibility guidance
          </button>
          <button type="button" onClick={() => go('/offices')}>
            Government offices
          </button>
        </div>

        <div>
          <b>Support</b>
          <button type="button" onClick={() => go('/faq')}>
            Help &amp; FAQ
          </button>
          <button type="button" onClick={() => go('/feedback')}>
            Feedback
          </button>
          <button type="button" onClick={() => go('/complaints')}>
            Complaints
          </button>
        </div>

        <div>
          <b>Platform</b>
          <button type="button" onClick={() => go('/about')}>
            About
          </button>
          <button type="button">Privacy</button>
          <button type="button">Accessibility</button>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 NagarikPath · This platform is an academic/prototype digital
        service interface and does not replace the legal authority of the
        Government of Nepal.
      </div>
    </footer>
  );
}

/* -------------------------- PageTitle -------------------------- */

export function PageTitle({ eyebrow, title, text, children }) {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="kicker">{eyebrow}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children}
    </main>
  );
}

/* ------------------------- ServiceCard ------------------------- */

export function ServiceCard({ s }) {
  return (
    <article className="service-card">
      <i>{s.icon}</i>
      <span>{s.category}</span>
      <h3>{s.name}</h3>
      <p>{s.desc}</p>
      <button type="button" onClick={() => go(`/services/${s.id}`)}>
        Explore service <b>→</b>
      </button>
    </article>
  );
}

/* --------------------------- Timeline --------------------------- */

export function Timeline() {
  return (
    <div className="timeline">
      {[
        ['✓', 'Application submitted', '12 Sep · 10:24'],
        ['✓', 'Document verification', '13 Sep · 14:10'],
        ['•', 'Officer review', 'In progress'],
        ['○', 'Final decision', 'Awaiting review']
      ].map(item => (
        <div key={item[1]}>
          <i>{item[0]}</i>
          <span>
            <b>{item[1]}</b>
            <small>{item[2]}</small>
          </span>
        </div>
      ))}
    </div>
  );
}