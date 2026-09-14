import { useEffect, useRef, useState } from 'react';
import { go } from '../utils/go';
import { PageTitle } from './Shared';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem('databridge_avatar') || '';
    } catch {
      return '';
    }
  });

  // Edit mode: opens directly when URL contains ?edit=1
  const [editing, setEditing] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('edit') === '1';
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    district: ''
  });

  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  /* Load user from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('databridge_user');
      const parsed = stored ? JSON.parse(stored) : null;
      setUser(parsed);
      setForm({
        name: parsed?.name || '',
        email: parsed?.email || '',
        phone: parsed?.phone || '',
        district: parsed?.district || ''
      });
    } catch {
      setUser(null);
    }
  }, []);

  const initials = (() => {
    const words = String(user?.name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return 'U';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  })();

  /* Avatar upload */
  const handleFile = event => {
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

  const removeAvatar = () => {
    setAvatar('');
    try {
      localStorage.removeItem('databridge_avatar');
    } catch {
      /* ignore */
    }
  };

  /* Edit-mode actions */
  const startEdit = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      district: user?.district || ''
    });
    setSaved(false);
    setEditing(true);

    // Keep the URL in sync so refresh / link share re-opens edit mode.
    if (!window.location.search.includes('edit=1')) {
      const url = new URL(window.location.href);
      url.searchParams.set('edit', '1');
      window.history.replaceState({}, '', url);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaved(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url);
  };

  const handleChange = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const saveEdit = event => {
    event.preventDefault();

    const updated = {
      ...(user || {}),
      name: form.name.trim() || user?.name || '',
      phone: form.phone.trim(),
      district: form.district.trim()
    };

    setUser(updated);
    setSaved(true);
    setEditing(false);

    try {
      localStorage.setItem('databridge_user', JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    // strip ?edit from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url);
  };

  return (
    <PageTitle
      eyebrow="MY PROFILE"
      title="Your citizen account details."
      text="Manage your information and how you appear in the platform."
    >
      <div className="profile-card">
        <div className="profile-avatar-large">
          {avatar ? (
            <img src={avatar} alt="" className="avatar-image" />
          ) : (
            initials
          )}
        </div>

        <div className="profile-avatar-controls">
          <button
            type="button"
            className="btn small"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload picture
          </button>

          {avatar && (
            <button
              type="button"
              className="outline small"
              onClick={removeAvatar}
            >
              Remove
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          <small>JPG or PNG · stored locally in this prototype.</small>
        </div>

        <div className="profile-info">
          <h2>{user?.name || 'Citizen'}</h2>
          <p>{user?.email || 'Not signed in'}</p>
          <span className="badge">{user?.role || 'CITIZEN'}</span>
        </div>

        {!editing && (
          <>
            <dl>
              <dt>Full name</dt>
              <dd>{user?.name || '—'}</dd>

              <dt>Email</dt>
              <dd>{user?.email || '—'}</dd>

              <dt>Phone</dt>
              <dd>{user?.phone || '—'}</dd>

              <dt>District</dt>
              <dd>{user?.district || '—'}</dd>

              <dt>Role</dt>
              <dd>{user?.role || '—'}</dd>
            </dl>

            <div className="profile-actions">
              <button
                type="button"
                className="btn"
                onClick={startEdit}
              >
                Edit info
              </button>

              {saved && (
                <span className="profile-saved">
                  ✓ Profile updated
                </span>
              )}
            </div>
          </>
        )}

        {editing && (
          <form className="profile-edit" onSubmit={saveEdit}>
            <h3>Edit information</h3>

            <label>
              Full name
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                readOnly
                title="Email cannot be changed in this prototype"
              />
            </label>

            <label>
              Phone number
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
                autoComplete="tel"
              />
            </label>

            <label>
              District
              <input
                name="district"
                type="text"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Kathmandu"
              />
            </label>

            <div className="profile-edit-actions">
              <button
                type="button"
                className="outline"
                onClick={cancelEdit}
              >
                Cancel
              </button>

              <button className="btn" type="submit">
                Save changes
              </button>
            </div>
          </form>
        )}
      </div>

      {user?.role === 'CITIZEN' && (
        <div className="profile-links">
          <button type="button" onClick={() => go('/citizen/dashboard')}>
            Go to dashboard →
          </button>
        </div>
      )}
    </PageTitle>
  );
}