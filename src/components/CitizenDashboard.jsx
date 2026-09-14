import { useEffect, useState } from 'react';
import { go } from '../utils/go';
import { PageTitle, Timeline } from './Shared';
import {
  listApplicationsForUser,
  STAGES
} from '../utils/applications';

function Dashboard({ user, onLogout }) {
  const userId = user?.id || user?.email || 'guest';

  const [applications, setApplications] = useState(() =>
    listApplicationsForUser(userId)
  );

  useEffect(() => {
    setApplications(listApplicationsForUser(userId));
  }, [userId]);

  const active = applications[0];

  const completed = applications.filter(
    application => application.status === 'COMPLETED'
  );

  const doneCount = completed.length;

  const stageIndex = active
    ? Math.max(STAGES.indexOf(active.status), 0)
    : 0;

  const progressPct = active
    ? Math.round(
        (stageIndex / (STAGES.length - 1)) * 100
      )
    : 0;

  return (
    <PageTitle
      eyebrow="CITIZEN DASHBOARD"
      title={`Namaste, ${user?.name || 'Citizen'}.`}
      text="Manage your citizenship service journey from one place."
    >
      <div className="dash-stats">
        {[
          [String(applications.length), 'Submitted applications'],
          [String(applications.length), 'In-progress records'],
          ['0', 'New notifications'],
          [String(doneCount), 'Completed services']
        ].map(item => (
          <article key={item[1]}>
            <b>{item[0]}</b>
            <span>{item[1]}</span>
          </article>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="dash-issued">
          <span className="kicker">ISSUED CERTIFICATE</span>

          <h2>Your citizenship certificate is ready.</h2>

          <p>
            Application <b>{completed[0].id}</b> has been completed. You can
            view or print the issued certificate.
          </p>

          <div className="dash-issued-actions">
            <button
              className="btn"
              type="button"
              onClick={() =>
                go(`/certificate/${completed[0].id}`)
              }
            >
              View citizenship →
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <section>
          <span className="kicker">ACTIVE APPLICATION</span>

          {active ? (
            <>
              <h2>{active.id}</h2>

              <p>
                {active.service} · {active.status}
              </p>

              <div className="dash-progress">
                <i
                  style={{
                    width: `${progressPct}%`
                  }}
                />
              </div>

              <Timeline />
            </>
          ) : (
            <>
              <h2>No active application</h2>

              <p>
                Start a citizenship service to see your live workflow stage
                here. The stage advances only when the responsible office
                updates it.
              </p>
            </>
          )}

          <button
            className="btn"
            type="button"
            onClick={() =>
              go(active ? '/track' : '/apply')
            }
          >
            {active
              ? 'View application →'
              : 'Start an application →'}
          </button>
        </section>

        <aside>
          <span className="kicker">QUICK ACTIONS</span>

          {[
            ['Apply for service', '/apply'],
            ['Check eligibility', '/eligibility'],
            ['View documents', '/checklist'],
            ['My profile', '/profile'],
            ['Track application', '/track'],
            ['Send feedback', '/feedback']
          ].map(item => (
            <button
              type="button"
              key={item[0]}
              onClick={() => go(item[1])}
            >
              {item[0]}
              <b>→</b>
            </button>
          ))}

          <button
            type="button"
            onClick={onLogout}
          >
            Sign out
            <b>→</b>
          </button>
        </aside>
      </div>
    </PageTitle>
  );
}

export function ProtectedCitizenDashboard({ user, onLogout }) {
  if (!user || user.role !== 'CITIZEN') {
    go('/login');
    return null;
  }

  return (
    <Dashboard
      user={user}
      onLogout={onLogout}
    />
  );
}

export default Dashboard;
