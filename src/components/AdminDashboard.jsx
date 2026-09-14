
import { useEffect, useState } from 'react';
import { getInitials, statusClass, go } from '../utils/go';
import { PageTitle } from '../components/Shared';
import {
  STAGES,
  advanceApplication,
  setApplicationStatus,
  fetchApplications,
  fetchNotifications,
  markNotificationRead,
  fetchAuditLogs,
  pushAuditLog,
  fetchGovernmentNotices
} from '../utils/applications';

function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [govNotices, setGovNotices] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);

    try {
      const [apps, notifs, audits, govs] = await Promise.all([
        fetchApplications(),
        fetchNotifications(),
        fetchAuditLogs(),
        fetchGovernmentNotices()
      ]);

      setApplications(
        Array.isArray(apps)
          ? apps
          : Array.isArray(apps?.applications)
            ? apps.applications
            : []
      );

      setNotifications(
        Array.isArray(notifs)
          ? notifs
          : Array.isArray(notifs?.notifications)
            ? notifs.notifications
            : []
      );

      setAuditLogs(
        Array.isArray(audits)
          ? audits
          : Array.isArray(audits?.auditLogs)
            ? audits.auditLogs
            : Array.isArray(audits?.logs)
              ? audits.logs
              : []
      );

      setGovNotices(
        Array.isArray(govs)
          ? govs
          : Array.isArray(govs?.notices)
            ? govs.notices
            : Array.isArray(govs?.governmentNotices)
              ? govs.governmentNotices
              : []
      );
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setApplications([]);
      setNotifications([]);
      setAuditLogs([]);
      setGovNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleAdvance = async app => {
    try {
      await advanceApplication(app.id);

      await pushAuditLog({
        actor: 'ADMIN',
        actorName: user?.name || 'Administrator',
        action: 'ADVANCE_APPLICATION',
        target: app.id,
        detail: `Advanced ${app.id} to next stage.`
      });

      await reload();

      setSelected(prev => {
        if (!prev) return prev;

        const updated = applications.find(a => a.id === prev.id);

        return updated ? { ...prev, ...updated } : prev;
      });
    } catch (error) {
      console.error('Failed to advance application:', error);
    }
  };

  const handleReset = async app => {
    try {
      await setApplicationStatus(app.id, 'SUBMITTED');

      await pushAuditLog({
        actor: 'ADMIN',
        actorName: user?.name || 'Administrator',
        action: 'RESET_APPLICATION',
        target: app.id,
        detail: `Reset ${app.id} to Submitted.`
      });

      await reload();
    } catch (error) {
      console.error('Failed to reset application:', error);
    }
  };

  const handleReadNotification = async id => {
    try {
      const updated = await markNotificationRead(id);

      setNotifications(
        Array.isArray(updated)
          ? updated
          : Array.isArray(updated?.notifications)
            ? updated.notifications
            : []
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const menuItems = [
    ['overview', '⌂', 'Overview'],
    ['applications', '▣', 'Applications'],
    ['government', '⌘', 'Government notices'],
    ['verification', '✓', 'Verification'],
    ['audit', '◌', 'Audit logs'],
    ['settings', '⚙', 'System settings']
  ];

  const renderOverview = () => (
    <>
      <div className="admin-welcome">
        <div>
          <span className="kicker">ADMINISTRATION CENTER</span>
          <h1>Good evening, {user?.name || 'Administrator'}.</h1>
          <p>
            Monitor citizen services, verification activity and platform
            operations from one administrative workspace.
          </p>
        </div>

        <div className="admin-date">
          <span>System date</span>
          <b>{new Date().toLocaleDateString()}</b>
          <small>All systems operational</small>
        </div>
      </div>

      <div className="admin-stats">
        {[
          {
            icon: '▣',
            value: String(applications.length),
            label: 'Applications',
            trend: `${applications.filter(
              a => a.status === 'SUBMITTED'
            ).length} new`
          },
          {
            icon: '◇',
            value: String(unread),
            label: 'Unread notifications',
            trend: `${notifications.length} total`
          },
          {
            icon: '⌘',
            value: String(govNotices.length),
            label: 'Government notices',
            trend: 'Forwarded to offices'
          },
          {
            icon: '◌',
            value: String(auditLogs.length),
            label: 'Audit events',
            trend: 'Prototype trail'
          }
        ].map(stat => (
          <article key={stat.label}>
            <div className="admin-stat-icon">{stat.icon}</div>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.trend}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-main-grid">
        <section className="admin-panel large">
          <div className="admin-panel-head">
            <div>
              <span className="kicker">APPLICATION MONITOR</span>
              <h2>Recent applications</h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('applications')}
            >
              View all →
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Citizen</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {applications.slice(0, 6).map((item, index) => (
                  <tr
                    key={
                      item.id ||
                      item._id ||
                      `application-${index}`
                    }
                  >
                    <td>
                      <b>{item.id || item._id || '—'}</b>
                    </td>

                    <td>{item.applicant?.fullName || '—'}</td>

                    <td>{item.serviceName || item.service || '—'}</td>

                    <td>
                      <span
                        className={`admin-status ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status || 'Unknown'}
                      </span>
                    </td>

                    <td>
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}

                {!applications.length && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        color: 'var(--muted)'
                      }}
                    >
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <span className="kicker">RECENT AUDIT</span>
              <h2>Platform activity</h2>
            </div>
          </div>

          <div className="audit-list compact">
            {auditLogs.slice(0, 5).map((item, index) => (
              <article
                key={
                  item.id ||
                  item._id ||
                  `audit-overview-${index}`
                }
              >
                <i>◌</i>

                <div>
                  <b>{item.detail || item.action || 'Activity'}</b>

                  <span>
                    {item.at
                      ? new Date(item.at).toLocaleString()
                      : item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : '—'}
                  </span>
                </div>

                <strong>{item.actor || 'SYSTEM'}</strong>
                <small>{item.action || 'EVENT'}</small>
              </article>
            ))}

            {!auditLogs.length && (
              <p style={{ color: 'var(--muted)' }}>
                No audit events recorded yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );

  const renderApplications = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">APPLICATION MANAGEMENT</span>
          <h2>Citizen applications</h2>

          <p>
            Click <b>Inspect</b> to view submitted info and advance the
            workflow stage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Citizen</th>
              <th>Service</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((item, index) => (
              <tr
                key={
                  item.id ||
                  item._id ||
                  `application-list-${index}`
                }
              >
                <td>
                  <b>{item.id || item._id || '—'}</b>
                </td>

                <td>{item.applicant?.fullName || '—'}</td>

                <td>{item.serviceName || item.service || '—'}</td>

                <td>
                  <span
                    className={`admin-status ${statusClass(
                      item.status
                    )}`}
                  >
                    {item.status || 'Unknown'}
                  </span>
                </td>

                <td>
                  {item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleDateString()
                    : '—'}
                </td>

                <td>
                  <button
                    className="table-action"
                    type="button"
                    onClick={() => setSelected(item)}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}

            {!applications.length && !loading && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: 'center',
                    color: 'var(--muted)'
                  }}
                >
                  No applications submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-detail">
          <div className="admin-detail-head">
            <div>
              <span className="kicker">APPLICATION DETAIL</span>
              <h3>{selected.id || selected._id || 'Application'}</h3>
            </div>

            <button
              type="button"
              className="table-action"
              onClick={() => setSelected(null)}
            >
              Close ✕
            </button>
          </div>

          <div className="admin-detail-grid">
            <div>
              <h4>Applicant</h4>

              <dl>
                <dt>Full name</dt>
                <dd>{selected.applicant?.fullName || '—'}</dd>

                <dt>Date of birth</dt>
                <dd>{selected.applicant?.dob || '—'}</dd>

                <dt>Gender</dt>
                <dd>{selected.applicant?.gender || '—'}</dd>
              </dl>
            </div>

            <div>
              <h4>Family</h4>

              <dl>
                <dt>Father's name</dt>
                <dd>{selected.applicant?.fatherName || '—'}</dd>

                <dt>Father's DOB</dt>
                <dd>{selected.applicant?.fatherDob || '—'}</dd>

                <dt>Mother's name</dt>
                <dd>{selected.applicant?.motherName || '—'}</dd>

                <dt>Mother's DOB</dt>
                <dd>{selected.applicant?.motherDob || '—'}</dd>
              </dl>
            </div>

            <div>
              <h4>Address</h4>

              <dl>
                <dt>Province</dt>
                <dd>{selected.applicant?.province || '—'}</dd>

                <dt>Zone</dt>
                <dd>{selected.applicant?.zone || '—'}</dd>

                <dt>District</dt>
                <dd>{selected.applicant?.district || '—'}</dd>

                <dt>Municipality</dt>
                <dd>
                  {selected.applicant?.municipality || '—'}
                </dd>

                <dt>Ward</dt>
                <dd>{selected.applicant?.ward || '—'}</dd>
              </dl>
            </div>

            <div>
              <h4>Contact</h4>

              <dl>
                <dt>Email</dt>
                <dd>{selected.contact?.email || '—'}</dd>

                <dt>Phone</dt>
                <dd>{selected.contact?.phone || '—'}</dd>
              </dl>

              <h4>Uploads</h4>

              <div className="admin-upload-row">
                {selected.uploads?.photo ? (
                  <img
                    src={selected.uploads.photo}
                    alt=""
                    className="admin-upload-thumb"
                  />
                ) : (
                  <div className="admin-upload-thumb placeholder">
                    Photo —
                  </div>
                )}

                {selected.uploads?.thumb ? (
                  <img
                    src={selected.uploads.thumb}
                    alt=""
                    className="admin-upload-thumb"
                  />
                ) : (
                  <div className="admin-upload-thumb placeholder">
                    Thumb —
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-detail-actions">
            <span>
              Current stage: <b>{selected.status}</b>
            </span>

            <div>
              <button
                type="button"
                className="outline small"
                onClick={() => handleReset(selected)}
              >
                Reset to Submitted
              </button>

              <button
                type="button"
                className="btn small"
                disabled={
                  selected.status === STAGES[STAGES.length - 1]
                }
                onClick={() => handleAdvance(selected)}
              >
                Advance stage →
              </button>
            </div>
          </div>

          <div className="admin-detail-history">
            <h4>History</h4>

            <ul>
              {(selected.history || []).map((h, index) => (
                <li
                  key={
                    h.id ||
                    h._id ||
                    `${h.stage || 'stage'}-${h.at || index}-${index}`
                  }
                >
                  <b>{h.stage || 'Stage'}</b> ·{' '}
                  {h.at
                    ? new Date(h.at).toLocaleString()
                    : '—'}{' '}
                  — {h.note || 'No note'}
                </li>
              ))}

              {!selected.history?.length && (
                <li>No history recorded yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );

  const renderGovernment = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">GOVERNMENT OUTREACH</span>
          <h2>Forwarded service requests</h2>

          <p>
            Each new citizen application notifies the responsible district
            office. This list is the dispatch ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="verification-grid">
        {govNotices.map((item, index) => (
          <article
            key={
              item.id ||
              item._id ||
              item.applicationId ||
              `government-notice-${index}`
            }
          >
            <span>{item.applicationId || '—'}</span>

            <h3>{item.service || 'Service request'}</h3>

            <p>
              {item.citizen || '—'} · {item.district || '—'},{' '}
              {item.province || '—'}
            </p>

            <div>
              <b>{item.office || 'Government office'}</b>

              <small>
                {item.at
                  ? new Date(item.at).toLocaleString()
                  : item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString()
                    : '—'}
              </small>
            </div>
          </article>
        ))}

        {!govNotices.length && (
          <p style={{ color: 'var(--muted)' }}>
            No government notices dispatched yet.
          </p>
        )}
      </div>
    </section>
  );

  const renderUsers = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">USER MANAGEMENT</span>
          <h2>Citizens &amp; authorized users</h2>

          <p>
            Role-based account overview for the prototype platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {[
              [
                'USR-1001',
                'Aarav Sharma',
                'aarav@example.test',
                'CITIZEN',
                'Active'
              ],
              [
                'USR-1002',
                'Sita Gurung',
                'sita@example.test',
                'CITIZEN',
                'Active'
              ],
              [
                'USR-1003',
                'Admin User',
                'admin@example.test',
                'ADMIN',
                'Active'
              ],
              [
                'USR-1004',
                'Officer User',
                'officer@example.test',
                'OFFICER',
                'Active'
              ]
            ].map(item => (
              <tr key={item[0]}>
                <td>
                  <b>{item[0]}</b>
                </td>

                <td>{item[1]}</td>
                <td>{item[2]}</td>

                <td>
                  <span className="role-pill">{item[3]}</span>
                </td>

                <td>
                  <span className="active-pill">
                    ● {item[4]}
                  </span>
                </td>

                <td>
                  <button
                    className="table-action"
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderVerification = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">DATABRIDGE</span>
          <h2>Verification requests</h2>

          <p>
            Authorized government data verification activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="verification-grid">
        {[
          [
            'VR-2026-0091',
            'Citizenship identity',
            'Department of Transport Management',
            'COMPLETED'
          ],
          [
            'VR-2026-0090',
            'Address verification',
            'Local Government / Municipality',
            'In progress'
          ],
          [
            'VR-2026-0089',
            'Education verification',
            'Department of Education',
            'COMPLETED'
          ],
          [
            'VR-2026-0088',
            'Tax verification',
            'Inland Revenue Department',
            'Pending'
          ]
        ].map(item => (
          <article key={item[0]}>
            <span>{item[0]}</span>
            <h3>{item[1]}</h3>
            <p>{item[2]}</p>

            <div>
              <b>{item[3]}</b>
              <button type="button">Open →</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderAudit = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">SECURITY</span>
          <h2>Audit logs</h2>

          <p>
            Every administrative and citizen action recorded by the
            platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="audit-list">
        {auditLogs.map((item, index) => (
          <article
            key={
              item.id ||
              item._id ||
              `audit-${index}`
            }
          >
            <i>◌</i>

            <div>
              <b>{item.detail || item.action || 'Activity'}</b>

              <span>
                {item.at
                  ? new Date(item.at).toLocaleString()
                  : item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString()
                    : '—'}
              </span>
            </div>

            <strong>{item.actor || 'SYSTEM'}</strong>
            <small>{item.action || 'EVENT'}</small>
          </article>
        ))}

        {!auditLogs.length && (
          <p style={{ color: 'var(--muted)' }}>
            No audit events recorded yet.
          </p>
        )}
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="admin-panel admin-full-panel">
      <div className="admin-panel-head">
        <div>
          <span className="kicker">CONFIGURATION</span>
          <h2>System settings</h2>

          <p>
            Prototype configuration and service information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('overview')}
        >
          ← Dashboard
        </button>
      </div>

      <div className="settings-grid">
        {[
          [
            'Citizen registration',
            'Allow new citizen accounts',
            true
          ],
          [
            'Application tracking',
            'Enable application status tracking',
            true
          ],
          [
            'DataBridge verification',
            'Allow authorized verification requests',
            true
          ],
          [
            'Public notices',
            'Display public service announcements',
            true
          ],
          [
            'Audit logging',
            'Record protected administrative events',
            true
          ],
          [
            'Maintenance mode',
            'Temporarily restrict public services',
            false
          ]
        ].map(item => (
          <article key={item[0]}>
            <div>
              <h3>{item[0]}</h3>
              <p>{item[1]}</p>
            </div>

            <span
              className={
                item[2]
                  ? 'setting-toggle enabled'
                  : 'setting-toggle'
              }
            >
              <i />
            </span>
          </article>
        ))}
      </div>
    </section>
  );

  const content = {
    overview: renderOverview,
    applications: renderApplications,
    government: renderGovernment,
    users: renderUsers,
    verification: renderVerification,
    audit: renderAudit,
    settings: renderSettings
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <i>नि</i>

          <div>
            <b>
              Nagarik<span>Path</span>
            </b>
            <small>Administration</small>
          </div>
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">
            {getInitials(user?.name)}
          </div>

          <div>
            <b>{user?.name || 'Administrator'}</b>
            <span>Administrator</span>
          </div>
        </div>

        <nav className="admin-nav">
          <span>WORKSPACE</span>

          {menuItems.map(item => (
            <button
              type="button"
              className={
                activeSection === item[0] ? 'active' : ''
              }
              key={item[0]}
              onClick={() => setActiveSection(item[0])}
            >
              <i>{item[1]}</i>
              {item[2]}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button type="button" onClick={onLogout}>
            ⇥ Sign out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>ADMINISTRATIVE WORKSPACE</span>
            <b>Government Service Management</b>
          </div>

          <div className="admin-top-actions">
            <div className="admin-bell-wrap">
              <button
                type="button"
                title="Notifications"
                onClick={() => setBellOpen(v => !v)}
              >
                ♢

                {unread > 0 && <i>{unread}</i>}
              </button>

              {bellOpen && (
                <div className="admin-bell-dropdown">
                  <div className="admin-bell-head">
                    <b>Notifications</b>
                    <small>{notifications.length} total</small>
                  </div>

                  {notifications
                    .slice(0, 8)
                    .map((n, index) => (
                      <button
                        key={
                          n.id ||
                          n._id ||
                          `notification-${index}`
                        }
                        type="button"
                        className={n.read ? '' : 'unread'}
                        onClick={() =>
                          handleReadNotification(
                            n.id || n._id
                          )
                        }
                      >
                        <b>{n.title || 'Notification'}</b>

                        <span>
                          {n.message || 'No message'}
                        </span>

                        <small>
                          {n.createdAt || n.at
                            ? new Date(
                                n.createdAt || n.at
                              ).toLocaleString()
                            : '—'}
                        </small>
                      </button>
                    ))}

                  {!notifications.length && (
                    <p className="admin-bell-empty">
                      No notifications yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="admin-top-user"
            >
              <span>{getInitials(user?.name)}</span>
              <b>{user?.name || 'Administrator'}</b>
              <small>ADMIN</small>
            </button>
          </div>
        </div>

        <div className="admin-page">
          {content[activeSection]()}
        </div>
      </main>
    </div>
  );
}

export function ProtectedAdminDashboard({
  user,
  onLogout
}) {
  if (user?.role !== 'ADMIN') {
    if (user?.role === 'OFFICER') {
      go('/databridge');
    } else if (user?.role === 'CITIZEN') {
      go('/');
    } else {
      go('/login');
    }

    return (
      <PageTitle
        eyebrow="CHECKING ACCESS"
        title="Redirecting…"
      />
    );
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={onLogout}
    />
  );
}

