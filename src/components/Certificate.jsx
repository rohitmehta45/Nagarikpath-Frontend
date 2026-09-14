import { useEffect, useState } from 'react';
import { go } from '../utils/go';
import { getApplication, fetchApplication } from '../utils/applications';
import { services } from '../data/siteData';

export default function Certificate({ id }) {
  const [app, setApp] = useState(() => getApplication(id));
  const [loading, setLoading] = useState(!app);

  useEffect(() => {
    let live = true;
    fetchApplication(id)
      .then(found => {
        if (live) setApp(found);
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <div className="cert-missing">
          <h1>Loading certificate…</h1>
        </div>
      </main>
    );
  }

  if (!app) {
    return (
      <main className="page">
        <div className="cert-missing">
          <h1>Certificate not found</h1>
          <p>
            No completed application matches ID <b>{id}</b>.
          </p>
          <button
            className="btn"
            type="button"
            onClick={() => go('/citizen/dashboard')}
          >
            Back to dashboard →
          </button>
        </div>
      </main>
    );
  }

  if (app.status !== 'COMPLETED') {
    return (
      <main className="page">
        <div className="cert-missing">
          <h1>Not yet issued</h1>
          <p>
            Application <b>{app.id}</b> is currently at stage{' '}
            <b>{app.status}</b>. A certificate is issued only after the
            responsible office marks it as <b>Completed</b>.
          </p>
          <button className="btn" type="button" onClick={() => go('/track')}>
            Track application →
          </button>
        </div>
      </main>
    );
  }

  const serviceName =
    services.find(s => s.id === app.service)?.name ||
    app.serviceName ||
    app.service;

  const issuedAt =
    [...(app.history || [])]
      .reverse()
      .find(h => h.stage === 'COMPLETED')?.at ||
    app.createdAt ||
    new Date().toISOString();

  const issuedDate = new Date(issuedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const a = app.applicant || {};

  return (
    <main className="page certificate-page">
      <div className="certificate-toolbar">
        <button
          className="outline"
          type="button"
          onClick={() => go('/citizen/dashboard')}
        >
          ← Dashboard
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>

      <article className="certificate" id="citizenship-certificate">
        <header className="cert-header">
          <div className="cert-emblem">नि</div>
          <div>
            <span className="cert-gov">Government of Nepal</span>
            <h1>Citizenship Certificate</h1>
            <small>नागरिकता प्रमाणपत्र · Prototype record</small>
          </div>
          <div className="cert-serial">
            <span>Certificate No.</span>
            <b>{app.id.replace('CIT-', 'NPC-')}</b>
          </div>
        </header>

        <div className="cert-body">
          <section className="cert-photo">
            {app.uploads?.photo ? (
              <img
                src={app.uploads.photo}
                alt=""
                className="cert-photo-img"
              />
            ) : (
              <div className="cert-photo-placeholder">Photo</div>
            )}

            <div className="cert-thumb">
              {app.uploads?.thumb ? (
                <img
                  src={app.uploads.thumb}
                  alt=""
                  className="cert-photo-img"
                />
              ) : (
                <div className="cert-photo-placeholder small">Thumb</div>
              )}
            </div>
          </section>

          <section className="cert-details">
            <dl>
              <dt>Full name</dt>
              <dd>{a.fullName || '—'}</dd>

              <dt>Date of birth</dt>
              <dd>{a.dob || '—'}</dd>

              <dt>Gender</dt>
              <dd>{a.gender || '—'}</dd>

              <dt>Father's name</dt>
              <dd>{a.fatherName || '—'}</dd>

              <dt>Father's DOB</dt>
              <dd>{a.fatherDob || '—'}</dd>

              <dt>Mother's name</dt>
              <dd>{a.motherName || '—'}</dd>

              <dt>Mother's DOB</dt>
              <dd>{a.motherDob || '—'}</dd>

              <dt>Permanent address</dt>
              <dd>
                {[
                  a.municipality,
                  a.ward ? `Ward ${a.ward}` : null,
                  a.district,
                  a.zone,
                  a.province
                ]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </dd>

              <dt>Issued on</dt>
              <dd>{issuedDate}</dd>
            </dl>
          </section>
        </div>

        <footer className="cert-footer">
          <div>
            <span>Service</span>
            <b>{serviceName}</b>
          </div>

          <div>
            <span>Issued on</span>
            <b>{issuedDate}</b>
          </div>

          <div>
            <span>Issuing office</span>
            <b>
              {a.district
                ? `${a.district} District Administration Office`
                : 'District Administration Office'}
            </b>
          </div>

          <div className="cert-seal">
            <span>Authorized signature</span>
            <i />
          </div>
        </footer>

        <div className="cert-footnote">
          This document is an academic prototype record. It is not a legal
          citizenship certificate and has no official validity.
        </div>
      </article>
    </main>
  );
}
