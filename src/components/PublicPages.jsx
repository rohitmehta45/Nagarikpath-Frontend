import { useEffect, useState } from 'react';
import { services, offices, notices, faqs } from '../data/siteData';
import { go, statusClass } from '../utils/go';
import {
  PageTitle,
  ServiceCard,
  Timeline
} from './Shared';
import {
  STAGES,
  createApplication,
  fileToDataUrl,
  fetchUserApplications,
  pushNotification,
  pushAuditLog,
  listApplicationsForUser
} from '../utils/applications';
import { isLoggedIn, requireLogin } from '../utils/auth';

/* ------------------------------- Home ------------------------------- */

export function Home({ hideHero = false }) {
  return (
    <>
      {!hideHero && (
        <section className="hero">
          <div className="contour" />
          <div className="hero-art">
            <div className="sun" />
            <div className="mountain m1" />
            <div className="mountain m2" />
            <div className="document">
              <div className="seal">नि</div>
              <b>
                CITIZENSHIP
                <br />
                SERVICE PATH
              </b>
              <span>Guidance record · 2026</span>
              <div className="doc-lines" />
            </div>
            <div className="chip">◈ Personalized guidance</div>
            <div className="chip two">✓ Transparent tracking</div>
          </div>
          <div className="hero-copy">
            <span className="kicker">
              CITIZEN SERVICE GUIDANCE · NEPAL
            </span>
            <h1>
              Citizenship services,
              <br />
              <em>made clearer.</em>
            </h1>
            <p>
              Find the right service, understand your requirements, submit
              your application and follow your citizenship service journey
              from one place.
            </p>
            <div className="actions">
              <button
                className="btn"
                type="button"
                onClick={() => go('/apply')}
              >
                Start citizenship service <b>→</b>
              </button>
              <button
                className="text-btn"
                type="button"
                onClick={() => go('/eligibility')}
              >
                Check eligibility <span>↗</span>
              </button>
            </div>
            <p className="mini-note">
              A guided digital workflow — always confirm requirements with
              the competent authority.
            </p>
          </div>
        </section>
      )}

      <section className="quick">
        <div className="quick-intro">
          <span className="kicker">START HERE</span>
          <h2>What do you need today?</h2>
        </div>
        {[
          ['◈', 'Find a service', 'Explore citizenship service guidance', '/services'],
          ['⌁', 'Check eligibility', 'Get a recommended service path', '/eligibility'],
          ['↗', 'Track application', 'View your application journey', '/track'],
          ['⌂', 'Find an office', 'Locate a responsible office', '/offices']
        ].map(item => (
          <button
            className="quick-card"
            type="button"
            key={item[1]}
            onClick={() => go(item[3])}
          >
            <i>{item[0]}</i>
            <b>{item[1]}</b>
            <span>{item[2]}</span>
            <em>→</em>
          </button>
        ))}
      </section>

      <section className="section journey">
        <div>
          <span className="kicker">ONE CLEAR JOURNEY</span>
          <h2>From questions to confidence.</h2>
          <p>
            Our guided pathway makes every step visible, so you know what
            to prepare and what happens next.
          </p>
          <button
            className="text-btn"
            type="button"
            onClick={() => go('/apply')}
          >
            Explore the service journey <span>→</span>
          </button>
        </div>
        <ol>
          {[
            ['01', 'Discover', 'Compare services and find the right starting point.'],
            ['02', 'Prepare', 'Receive a checklist shaped around your situation.'],
            ['03', 'Apply', 'Complete a guided application and review it.'],
            ['04', 'Follow', 'See each stage, update and next action.']
          ].map(item => (
            <li key={item[0]}>
              <span>{item[0]}</span>
              <b>{item[1]}</b>
              <p>{item[2]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section-top">
          <div>
            <span className="kicker">CITIZENSHIP SERVICES</span>
            <h2>Guidance that meets you where you are.</h2>
          </div>
          <button
            className="outline"
            type="button"
            onClick={() => go('/services')}
          >
            View all services →
          </button>
        </div>
        <div className="service-grid">
          {services.slice(0, 3).map(service => (
            <ServiceCard key={service.id} s={service} />
          ))}
        </div>
      </section>

      <section className="section split-info">
        <div className="check-preview">
          <span className="kicker">PERSONALIZED CHECKLIST</span>
          <h2>See what to prepare, before you begin.</h2>
          <p>
            Build confidence with a clear list of required, conditional and
            additional-verification documents.
          </p>
          <div className="progress-label">
            <span>Checklist progress</span>
            <b>70% complete</b>
          </div>
          <div className="progress">
            <i style={{ width: '70%' }} />
          </div>
          {[
            'Birth registration certificate',
            'Parent citizenship certificates',
            'Local recommendation'
          ].map((document, index) => (
            <div className="doc-row" key={document}>
              <i className={index < 2 ? 'done' : ''}>
                {index < 2 ? '✓' : '○'}
              </i>
              <span>
                {document}
                <small>{index < 2 ? 'Ready for review' : 'Still needed'}</small>
              </span>
              <b>{index < 2 ? 'Verified' : 'Required'}</b>
            </div>
          ))}
          <button
            className="btn"
            type="button"
            onClick={() => go('/checklist')}
          >
            Open checklist →
          </button>
        </div>
        <div className="tracking-preview">
          <span className="kicker">TRACKING, WITHOUT GUESSWORK</span>
          <h2>Every update has a place.</h2>
          <p>
            Follow a clear, respectful timeline and know when action is
            needed from you.
          </p>
          <Timeline status="Officer review" />
          <button
            className="text-btn"
            type="button"
            onClick={() => go('/track')}
          >
            Track an application <span>→</span>
          </button>
        </div>
      </section>

      <section className="section stats">
        {[
          ['6', 'Guided services'],
          ['7', 'Workflow stages'],
          ['4', 'Office locations'],
          ['24/7', 'Digital guidance']
        ].map(item => (
          <div key={item[1]}>
            <b>{item[0]}</b>
            <span>{item[1]}</span>
          </div>
        ))}
      </section>

      <section className="section notices-home">
        <div className="section-top">
          <div>
            <span className="kicker">SERVICE UPDATES</span>
            <h2>Notices & information</h2>
          </div>
          <button
            className="outline"
            type="button"
            onClick={() => go('/notices')}
          >
            All notices →
          </button>
        </div>
        {notices.map(notice => (
          <article key={notice[0]}>
            <span>{notice[1]}</span>
            <h3>{notice[0]}</h3>
            <time>{notice[2]}</time>
            <button type="button" onClick={() => go('/notices')}>
              Read notice →
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

/* ----------------------------- Services ----------------------------- */

export function Services() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = [
    'All',
    ...new Set(services.map(s => s.category))
  ];

  const list = services.filter(service => {
    const matchesCategory =
      category === 'All' || service.category === category;
    const matchesQuery = service.name
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <PageTitle
      eyebrow="SERVICE DISCOVERY"
      title="Find the service that fits your situation."
      text="Requirements can vary by individual circumstances. Start with guidance, then confirm with the responsible authority."
    >
      <div className="filters">
        <label>
          ⌕
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search citizenship services"
          />
        </label>
        <select
          value={category}
          onChange={event => setCategory(event.target.value)}
        >
          {categories.map(item => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="service-grid all-services">
        {list.length ? (
          list.map(service => (
            <ServiceCard key={service.id} s={service} />
          ))
        ) : (
          <div className="empty-state">
            <h3>No services found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </div>
    </PageTitle>
  );
}

/* -------------------------- ServiceDetail -------------------------- */

export function ServiceDetail({ id }) {
  const service =
    services.find(item => item.id === id) || services[0];

  return (
    <PageTitle
      eyebrow={service.category.toUpperCase()}
      title={service.name}
      text={service.desc}
    >
      <div className="detail-layout">
        <main>
          <section>
            <h2>Overview</h2>
            <p>
              This digital service guidance explains a possible path and
              helps organize your preparation. A competent authority will
              determine applicable requirements and any final decision.
            </p>
          </section>
          <section>
            <h2>Who can apply</h2>
            <p>
              Individuals whose circumstances correspond to this service,
              subject to verification by the responsible office.
            </p>
          </section>
          <section>
            <h2>Required documents</h2>
            {service.docs.map(document => (
              <div className="requirement" key={document}>
                ✓
                <span>
                  <b>{document}</b>
                  <small>
                    Required or subject to authority confirmation
                  </small>
                </span>
              </div>
            ))}
          </section>
          <section>
            <h2>How the workflow works</h2>
            <div className="workflow">
              {[
                'Prepare information',
                'Submit application',
                'DOCUMENT_VERIFICATION',
                'OFFICER_REVIEW',
                'Decision & update'
              ].map((item, index) => (
                <span key={item}>
                  <b>{index + 1}</b>
                  {item}
                </span>
              ))}
            </div>
          </section>
        </main>

        <aside className="service-aside">
          <span className="badge">SERVICE GUIDANCE</span>
          <h3>Ready to begin?</h3>
          <p>
            Use the guided application to organize your details and
            documents.
          </p>
          <button
            className="btn"
            type="button"
            onClick={() => go(`/apply?service=${service.id}`)}
          >
            Start application →
          </button>
          <hr />
          <b>Responsible office</b>
          <p>District Administration Office</p>
          <b>Important note</b>
          <p>
            Requirements may depend on your circumstances and official
            verification.
          </p>
        </aside>
      </div>
    </PageTitle>
  );
}

/* ---------------------------- Eligibility ---------------------------- */

export function Eligibility() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    [
      'existing',
      'Do you already have a citizenship certificate?',
      [
        'No, this is my first application',
        'Yes, but it is lost or damaged',
        'Yes, I need a correction'
      ]
    ],
    [
      'basis',
      'What is your service based on?',
      [
        'Parentage or descent',
        'Marriage or family status',
        'Verification or other purpose'
      ]
    ],
    [
      'confirm',
      'What would you like help with?',
      [
        'Understanding required documents',
        'Starting a guided application',
        'Finding the responsible office'
      ]
    ]
  ];

  const result = answers.existing?.includes('lost')
    ? 'replacement'
    : answers.existing?.includes('correction')
      ? 'correction'
      : answers.basis?.includes('Marriage')
        ? 'marriage'
        : answers.basis?.includes('Parentage')
          ? 'descent'
          : 'new';

  const service =
    services.find(item => item.id === result) || services[0];

  return (
    <PageTitle
      eyebrow="SMART ELIGIBILITY CHECKER"
      title="A clearer place to start."
      text="Answer a few questions to receive general service guidance."
    >
      <div className="wizard">
        <div className="steps">
          {questions.map((question, index) => (
            <span
              className={index <= step ? 'active' : ''}
              key={question[0]}
            >
              {index + 1}
              <small>{['Situation', 'Path', 'Next step'][index]}</small>
            </span>
          ))}
        </div>

        {step < 3 ? (
          <div className="question">
            <span>Question {step + 1} of 3</span>
            <h2>{questions[step][1]}</h2>
            <div>
              {questions[step][2].map(option => (
                <button
                  type="button"
                  className={
                    answers[questions[step][0]] === option
                      ? 'selected'
                      : ''
                  }
                  key={option}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      [questions[step][0]]: option
                    })
                  }
                >
                  {option}
                  <b>→</b>
                </button>
              ))}
            </div>
            <button
              className="btn"
              type="button"
              disabled={!answers[questions[step][0]]}
              onClick={() => setStep(step + 1)}
            >
              {step === 2 ? 'See recommendation' : 'Continue →'}
            </button>
          </div>
        ) : (
          <div className="recommend">
            <span className="badge">RECOMMENDED SERVICE</span>
            <h2>{service.name}</h2>
            <p>
              Based on the answers you gave, this is the most relevant
              service path to explore.
            </p>
            <div>
              <b>Why this was recommended</b>
              <p>
                Your answers suggest a{' '}
                {service.category.toLowerCase()} service route. The
                responsible office will confirm the appropriate process.
              </p>
            </div>
            <div>
              <b>Prepare to review</b>
              <ul>
                {service.docs.map(document => (
                  <li key={document}>✓ {document}</li>
                ))}
              </ul>
            </div>
            <button
              className="btn"
              type="button"
              onClick={() => go(`/apply?service=${service.id}`)}
            >
              Start this service →
            </button>
            <button
              className="text-btn"
              type="button"
              onClick={() => {
                setAnswers({});
                setStep(0);
              }}
            >
              Start again
            </button>
            <p className="disclaimer">
              This eligibility result is provided as general service
              guidance only and does not constitute a legal decision or
              guarantee of eligibility.
            </p>
          </div>
        )}
      </div>
    </PageTitle>
  );
}

/* ------------------------------- Apply ------------------------------- */

const EMPTY_FORM = {
  service: 'new',
  fullName: '',
  dob: '',
  gender: '',
  fatherName: '',
  fatherDob: '',
  motherName: '',
  motherDob: '',
  province: '',
  zone: '',
  district: '',
  municipality: '',
  ward: '',
  email: '',
  phone: '',
  photo: '',
  thumb: ''
};

const PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
];

const ZONES = [
  'Mechi', 'Koshi', 'Sagarmatha', 'Janakpur', 'Bagmati', 'Narayani',
  'Gandaki', 'Lumbini', 'Dhawalagiri', 'Rapti', 'Bheri', 'Karnali',
  'Seti', 'Mahakali'
];

export function Apply() {
  const [step, setStep] = useState(0);
  const params = new URLSearchParams(window.location.search);
  const initialService = params.get('service') || 'new';

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    service: initialService
  });

  const [sent, setSent] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Auth guard ────────────────────────────────────────────────────
   * If the visitor isn't logged in, bounce them to /login with
   * ?returnTo=/apply?service=... so they come straight back here.
   * ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isLoggedIn()) {
      requireLogin(
        `/apply?service=${encodeURIComponent(initialService)}`
      );
    }
  }, [initialService]);

  const steps = [
    'Service',
    'Personal details',
    'Family details',
    'Address',
    'Contact',
    'Uploads',
    'Review',
    'Submit'
  ];

  const set = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleFile = async (key, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    set(key, dataUrl);
    event.target.value = '';
  };

  if (sent && created) {
    return (
      <PageTitle
        eyebrow="APPLICATION RECEIVED"
        title="Your service journey has started."
      >
        <div className="confirmation">
          <i>✓</i>
          <h2>Application {created.id} created</h2>
          <p>
            Your application has been submitted and is now waiting for
            officer review. The tracking timeline will only advance when
            the responsible office updates it.
          </p>
          <button className="btn" type="button" onClick={() => go('/track')}>
            Track application →
          </button>
        </div>
      </PageTitle>
    );
  }

  let body;

  if (step === 0) {
    body = (
      <>
        <h2>Select a service</h2>
        <select
          value={form.service}
          onChange={event => set('service', event.target.value)}
        >
          {services.map(service => (
            <option value={service.id} key={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </>
    );
  } else if (step === 1) {
    body = (
      <>
        <h2>Personal information</h2>
        <label>
          Full name
          <input
            required
            value={form.fullName}
            onChange={event => set('fullName', event.target.value)}
            placeholder="Use demo information only"
          />
        </label>
        <div className="form-grid">
          <label>
            Date of birth
            <input
              type="date"
              required
              value={form.dob}
              onChange={event => set('dob', event.target.value)}
            />
          </label>
          <label>
            Gender
            <select
              value={form.gender}
              onChange={event => set('gender', event.target.value)}
              required
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </label>
        </div>
      </>
    );
  } else if (step === 2) {
    body = (
      <>
        <h2>Family details</h2>
        <label>
          Father's full name
          <input
            required
            value={form.fatherName}
            onChange={event => set('fatherName', event.target.value)}
          />
        </label>
        <label>
          Father's date of birth
          <input
            type="date"
            value={form.fatherDob}
            onChange={event => set('fatherDob', event.target.value)}
          />
        </label>
        <label>
          Mother's full name
          <input
            required
            value={form.motherName}
            onChange={event => set('motherName', event.target.value)}
          />
        </label>
        <label>
          Mother's date of birth
          <input
            type="date"
            value={form.motherDob}
            onChange={event => set('motherDob', event.target.value)}
          />
        </label>
      </>
    );
  } else if (step === 3) {
    body = (
      <>
        <h2>Address</h2>
        <div className="form-grid">
          <label>
            Province
            <select
              required
              value={form.province}
              onChange={event => set('province', event.target.value)}
            >
              <option value="">Select province</option>
              {PROVINCES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Zone
            <select
              value={form.zone}
              onChange={event => set('zone', event.target.value)}
            >
              <option value="">Select zone</option>
              {ZONES.map(z => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label>
            District
            <select
              required
              value={form.district}
              onChange={event => set('district', event.target.value)}
            >
              <option value="">Select district</option>
              {offices.map(office => (
                <option key={office[1]}>{office[1]}</option>
              ))}
            </select>
          </label>
          <label>
            Municipality / Rural municipality
            <input
              required
              value={form.municipality}
              onChange={event => set('municipality', event.target.value)}
            />
          </label>
        </div>
        <label>
          Ward number
          <input
            required
            value={form.ward}
            onChange={event => set('ward', event.target.value)}
            placeholder="e.g. 5"
          />
        </label>
      </>
    );
  } else if (step === 4) {
    body = (
      <>
        <h2>Contact information</h2>
        <label>
          Email address
          <input
            type="email"
            required
            value={form.email}
            onChange={event => set('email', event.target.value)}
          />
        </label>
        <label>
          Mobile number
          <input
            required
            value={form.phone}
            onChange={event => set('phone', event.target.value)}
            placeholder="98XXXXXXXX"
          />
        </label>
      </>
    );
  } else if (step === 5) {
    body = (
      <>
        <h2>Uploads</h2>
        <p>
          Upload a recent passport-size photograph and a thumb impression.
          These are stored locally in this prototype.
        </p>
        <div className="upload-grid">
          <div className="upload-card">
            <span className="kicker">PHOTOGRAPH</span>
            {form.photo ? (
              <img src={form.photo} alt="" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">▧</div>
            )}
            <label className="upload-btn">
              {form.photo ? 'Replace photo' : 'Choose photo'}
              <input
                type="file"
                accept="image/*"
                onChange={event => handleFile('photo', event)}
                hidden
              />
            </label>
          </div>
          <div className="upload-card">
            <span className="kicker">THUMB IMPRESSION</span>
            {form.thumb ? (
              <img src={form.thumb} alt="" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">☝</div>
            )}
            <label className="upload-btn">
              {form.thumb ? 'Replace thumb' : 'Choose thumb image'}
              <input
                type="file"
                accept="image/*"
                onChange={event => handleFile('thumb', event)}
                hidden
              />
            </label>
          </div>
        </div>
      </>
    );
  } else if (step === 6) {
    const selectedService =
      services.find(s => s.id === form.service) || services[0];

    body = (
      <>
        <h2>Review your application</h2>
        <div className="review">
          <b>{selectedService.name}</b>
          <span>Applicant: {form.fullName || 'Not entered'}</span>
          <span>Date of birth: {form.dob || 'Not entered'}</span>
          <span>Father: {form.fatherName || 'Not entered'}</span>
          <span>Mother: {form.motherName || 'Not entered'}</span>
          <span>
            Address:{' '}
            {[form.municipality, form.ward, form.district, form.zone, form.province]
              .filter(Boolean)
              .join(', ') || 'Not entered'}
          </span>
          <span>Contact: {form.email || 'Not entered'}</span>
          <span>
            Uploads: {form.photo ? 'Photo ✓' : 'Photo —'} ·{' '}
            {form.thumb ? 'Thumb ✓' : 'Thumb —'}
          </span>
        </div>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <p>
          By continuing, you acknowledge this is a prototype demonstration
          and the authority will need to validate any real information.
        </p>
      </>
    );
  } else {
    body = (
      <>
        <h2>Ready to submit?</h2>
        <p>
          Submitting creates your demo application ID. Your tracking
          timeline will begin at <b>Submitted</b> and only advance when the
          responsible office updates it.
        </p>
      </>
    );
  }

  const validateReview = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.dob) return 'Date of birth is required.';
    if (!form.fatherName.trim()) return "Father's name is required.";
    if (!form.motherName.trim()) return "Mother's name is required.";
    if (!form.province) return 'Province is required.';
    if (!form.district) return 'District is required.';
    if (!form.municipality.trim()) return 'Municipality is required.';
    if (!form.ward.trim()) return 'Ward number is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    return '';
  };

  const submit = async () => {
    const message = validateReview();
    if (message) {
      setError(message);
      return;
    }

    /* ── Final safety net: session could have expired while filling
     *    the form. If so, send them back to login and preserve state. */
    if (!isLoggedIn()) {
      requireLogin(
        `/apply?service=${encodeURIComponent(form.service)}`
      );
      return;
    }

    setError('');
    setSubmitting(true);

    const selectedService =
      services.find(s => s.id === form.service) || services[0];

    try {
      /* Server derives userId from the JWT and writes
       * notification + government notice + audit log itself. */
      const app = await createApplication({
        service: form.service,
        serviceName: selectedService.name,
        applicant: {
          fullName: form.fullName,
          dob: form.dob,
          gender: form.gender,
          fatherName: form.fatherName,
          fatherDob: form.fatherDob,
          motherName: form.motherName,
          motherDob: form.motherDob,
          province: form.province,
          zone: form.zone,
          district: form.district,
          municipality: form.municipality,
          ward: form.ward
        },
        contact: { email: form.email, phone: form.phone },
        uploads: { photo: form.photo, thumb: form.thumb }
      });

      setCreated(app);
      setSent(true);
    } catch (err) {
      setError(
        err?.message ||
          'Unable to submit your application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTitle
      eyebrow="GUIDED APPLICATION"
      title="Complete your application, one careful step at a time."
      text="Use dummy information only. This is an academic prototype."
    >
      <div className="apply-layout">
        <div className="apply-steps">
          {steps.map((item, index) => (
            <div
              className={
                index === step
                  ? 'now'
                  : index < step
                    ? 'finished'
                    : ''
              }
              key={item}
            >
              <i>{index < step ? '✓' : index + 1}</i>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <form
          className="application-form"
          onSubmit={event => {
            event.preventDefault();
            if (step === steps.length - 1) {
              submit();
            } else {
              setStep(step + 1);
            }
          }}
        >
          <span>
            Step {step + 1} of {steps.length}
          </span>
          {body}
          <div className="form-actions">
            {step > 0 && (
              <button
                type="button"
                className="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button className="btn" disabled={submitting}>
              {step === steps.length - 1
                ? submitting
                  ? 'Submitting…'
                  : 'Submit application'
                : 'Save & continue →'}
            </button>
          </div>
        </form>
      </div>
    </PageTitle>
  );
}

/* ----------------------------- Checklist ----------------------------- */

export function Checklist() {
  const [items, setItems] = useState([
    ['Birth registration certificate', 'Required', 'Verified'],
    ['Parent citizenship certificates', 'Required', 'Uploaded'],
    ['Local recommendation', 'Conditional', 'Not uploaded'],
    [
      'Additional relationship evidence',
      'Additional verification',
      'Not requested'
    ]
  ]);

  const done = items.filter(
    item => !['Not uploaded', 'Not requested'].includes(item[2])
  ).length;

  const percentage = Math.round((done / items.length) * 100);

  return (
    <PageTitle
      eyebrow="DOCUMENT MANAGEMENT"
      title="Your personalized checklist."
      text="Statuses and remarks are part of a transparent service journey."
    >
      <div className="checklist">
        <div className="check-summary">
          <span>Checklist progress</span>
          <b>{percentage}% complete</b>
          <div className="progress">
            <i style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {items.map((item, index) => (
          <article key={item[0]}>
            <i className={item[2] === 'Verified' ? 'good' : ''}>
              {item[2] === 'Verified' ? '✓' : '▧'}
            </i>
            <div>
              <span className="badge">{item[1]}</span>
              <h3>{item[0]}</h3>
              <p>
                {item[2] === 'Not uploaded'
                  ? 'Needed to support this service path.'
                  : item[2] === 'Verified'
                    ? 'Document checked in this prototype workflow.'
                    : 'Ready for officer review.'}
              </p>
            </div>
            <div className={`doc-status ${statusClass(item[2])}`}>
              {item[2]}
            </div>
            {item[2] !== 'Verified' && (
              <button
                type="button"
                className="outline"
                onClick={() =>
                  setItems(
                    items.map((value, itemIndex) =>
                      itemIndex === index
                        ? [value[0], value[1], 'Uploaded']
                        : value
                    )
                  )
                }
              >
                {item[2] === 'Uploaded' ? 'Replace' : 'Upload'}
              </button>
            )}
          </article>
        ))}
      </div>
    </PageTitle>
  );
}

/* -------------------------------- Track -------------------------------- */

function LiveTimeline({ app }) {
  const reached = app?.status || 'SUBMITTED';
  const reachedIndex = STAGES.indexOf(reached);
  const history = app?.history || [];

  const stageTime = stage => {
    const entry = [...history].reverse().find(h => h.stage === stage);
    return entry
      ? new Date(entry.at).toLocaleString()
      : 'Awaiting update';
  };

  return (
    <div className="timeline">
      {STAGES.map((stage, index) => {
        const isDone = index < reachedIndex;
        const isCurrent = index === reachedIndex;
        return (
          <div key={stage}>
            <i
              style={{
                background: isDone
                  ? '#e2ecde'
                  : isCurrent
                    ? '#f3dfb6'
                    : '#eee7dc',
                color: isDone
                  ? 'var(--green)'
                  : isCurrent
                    ? '#8c5a16'
                    : 'var(--muted)'
              }}
            >
              {isDone ? '✓' : isCurrent ? '•' : '○'}
            </i>
            <span>
              <b>{stage}</b>
              <small>{stageTime(stage)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Track() {
  let initialUser = null;
  try {
    const stored = localStorage.getItem('databridge_user');
    initialUser = stored ? JSON.parse(stored) : null;
  } catch {
    initialUser = null;
  }

  const userId =
    initialUser?._id ||
    initialUser?.id ||
    initialUser?.email ||
    'guest';

  const [applications, setApplications] = useState(() =>
    listApplicationsForUser(userId)
  );

  const [manualId, setManualId] = useState(
    listApplicationsForUser(userId)[0]?.id || ''
  );

  const [loadedManual, setLoadedManual] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await fetchUserApplications(userId);
      setApplications(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchUserApplications(userId)
      .then(list => {
        if (live) setApplications(list);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const submitManual = async () => {
    const trimmed = manualId.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const list = await fetchUserApplications(userId);
      const found =
        list.find(
          a => a.id.toLowerCase() === trimmed.toLowerCase()
        ) || null;
      setLoadedManual(found);
    } finally {
      setLoading(false);
    }
  };

  const current = applications[0] || loadedManual;

  return (
    <PageTitle
      eyebrow="APPLICATION TRACKING"
      title="Know where your application stands."
      text="Enter an application ID to see its prototype workflow history."
    >
      <div className="track-search">
        <input
          value={manualId}
          onChange={event => setManualId(event.target.value)}
          placeholder="e.g. CIT-2026-00001"
        />
        <button className="btn" type="button" onClick={submitManual}>
          Track application →
        </button>
      </div>

      {loading && !current && (
        <div className="track-card">
          <div>
            <span className="badge">LOADING</span>
            <h2>Fetching your applications…</h2>
          </div>
        </div>
      )}

      {!loading && !current && (
        <div className="track-card">
          <div>
            <span className="badge">NO APPLICATION YET</span>
            <h2>Nothing to track</h2>
            <p>
              Once you submit an application, its live workflow timeline
              will appear here. The timeline advances only when the
              responsible office updates its stage.
            </p>
            <button
              className="btn"
              type="button"
              onClick={() => go('/apply')}
            >
              Start an application →
            </button>
          </div>
        </div>
      )}

      {current && (
        <div className="track-card">
          <div>
            <span className="badge">
              {String(current.status).toUpperCase()}
            </span>
            <h2>{current.id}</h2>
            <p>
              {current.serviceName ||
                services.find(s => s.id === current.service)?.name ||
                current.service}{' '}
              · Submitted{' '}
              {new Date(current.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="tracking-full">
            <LiveTimeline app={current} />
            <aside>
              <b>Current stage</b>
              <h3>{current.status}</h3>
              <p>
                {current.status === 'SUBMITTED'
                  ? 'Your application is queued for document verification. No action is required right now.'
                  : current.status === 'COMPLETED'
                    ? 'Your citizenship certificate has been issued. You can view it now.'
                    : 'The responsible office is progressing this application.'}
              </p>
              <small>
                Timeline updates are controlled by the responsible office.
              </small>
              <div className="track-actions">
                <button
                  className="outline small"
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh status'}
                </button>
                {current.status === 'COMPLETED' && (
                  <button
                    className="btn small"
                    type="button"
                    onClick={() =>
                      go(`/certificate/${current.id}`)
                    }
                  >
                    View citizenship →
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </PageTitle>
  );
}

/* ------------------------------- Offices ------------------------------- */

export function Offices() {
  const [query, setQuery] = useState('');
  const filtered = offices.filter(office =>
    office.join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageTitle
      eyebrow="GOVERNMENT OFFICE DIRECTORY"
      title="Find the office that can help."
      text="Contact offices directly to confirm their available services and current requirements."
    >
      <div className="filters">
        <label>
          ⌕
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by office or district"
          />
        </label>
      </div>

      <div className="office-grid">
        {filtered.map(office => (
          <article key={office[0]}>
            <i>⌂</i>
            <span>{office[1].toUpperCase()} DISTRICT</span>
            <h3>{office[0]}</h3>
            <p>
              District Administration Office
              <br />
              Sun–Thu · 10:00–16:00
            </p>
            <a href={`tel:${office[2]}`}>{office[2]}</a>
            <button type="button" onClick={() => go('/services')}>
              View services →
            </button>
          </article>
        ))}
      </div>
    </PageTitle>
  );
}

/* --------------------------------- Faq --------------------------------- */

export function Faq() {
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState('');

  const filtered = faqs.filter(item =>
    item.join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageTitle eyebrow="HELP CENTRE" title="Questions, answered with care.">
      <div className="faq">
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search help topics"
        />

        {filtered.map((item, index) => (
          <article
            className={open === index ? 'expanded' : ''}
            key={item[0]}
          >
            <button
              type="button"
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              <b>{item[0]}</b>
              <span>{open === index ? '−' : '+'}</span>
            </button>
            {open === index && <p>{item[1]}</p>}
          </article>
        ))}
      </div>
    </PageTitle>
  );
}

/* ------------------------------- Notices ------------------------------- */

export function Notices() {
  return (
    <PageTitle
      eyebrow="PUBLIC NOTICES"
      title="Latest service information."
    >
      <div className="notice-list">
        {notices.map(notice => (
          <article key={notice[0]}>
            <span className="badge">{notice[1]}</span>
            <h2>{notice[0]}</h2>
            <p>
              Published {notice[2]} · Please contact the responsible office
              for service-specific confirmation.
            </p>
            <button className="text-btn" type="button">
              View information →
            </button>
          </article>
        ))}
      </div>
    </PageTitle>
  );
}

/* ------------------------------ MessageForm ------------------------------ */

export function MessageForm({ kind }) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setSending(true);

    const subject =
      event.target.elements.subject?.value || '';
    const message =
      event.target.elements.message?.value || '';

    try {
      await pushNotification({
        type: kind === 'feedback' ? 'FEEDBACK' : 'COMPLAINT',
        title:
          kind === 'feedback'
            ? 'New citizen feedback'
            : 'New citizen complaint',
        message: subject || message,
        citizen: subject
      });

      await pushAuditLog({
        actor: 'CITIZEN',
        action:
          kind === 'feedback'
            ? 'SUBMIT_FEEDBACK'
            : 'SUBMIT_COMPLAINT',
        detail: subject || message
      });
    } catch {
      /* ignore — prototype */
    }

    setSending(false);
    setDone(true);
  };

  return (
    <PageTitle
      eyebrow={kind.toUpperCase()}
      title={
        kind === 'feedback'
          ? 'Help improve the service experience.'
          : 'Raise a service concern.'
      }
      text="Messages are recorded in this prototype for transparent follow-up."
    >
      {done ? (
        <div className="confirmation">
          <i>✓</i>
          <h2>
            {kind === 'feedback'
              ? 'Thank you for your feedback.'
              : 'Your complaint has been submitted.'}
          </h2>
          <p>You can view the recorded status from your citizen dashboard.</p>
          <button
            className="btn"
            type="button"
            onClick={() => go('/citizen/dashboard')}
          >
            Go to dashboard →
          </button>
        </div>
      ) : (
        <form className="message-form" onSubmit={submit}>
          <label>
            Subject
            <input
              name="subject"
              required
              placeholder={
                kind === 'feedback'
                  ? 'Service suggestion'
                  : 'Brief description'
              }
            />
          </label>
          <label>
            Application ID <small>(optional)</small>
            <input placeholder="CIT-2026-00001" />
          </label>
          {kind === 'complaints' && (
            <label>
              Category
              <select>
                <option>Service issue</option>
                <option>Document concern</option>
                <option>Technical support</option>
              </select>
            </label>
          )}
          <label>
            Message
            <textarea
              name="message"
              required
              rows="6"
              placeholder="Tell us what happened or what could be better"
            />
          </label>
          <label className="file">
            Attachment <small>(optional)</small>
            <input type="file" />
          </label>
          <button className="btn" disabled={sending}>
            {sending ? 'Submitting…' : `Submit ${kind} →`}
          </button>
        </form>
      )}
    </PageTitle>
  );
}

/* -------------------------------- About -------------------------------- */

export function About() {
  return (
    <PageTitle
      eyebrow="ABOUT NAGARIKPATH"
      title="A citizen-first service navigation prototype."
      text="NagarikPath is an academic concept for making citizenship service journeys clearer, more transparent and easier to prepare for."
    >
      <div className="about-grid">
        {[
          [
            'Citizen-centred',
            'Service discovery, tailored preparation and transparent updates reduce uncertainty for people navigating a public service.'
          ],
          [
            'Privacy-minded',
            'The prototype demonstrates data minimization, role-based access and auditable government verification requests.'
          ],
          [
            'Interoperable by design',
            'The Government Interoperability & Verification Layer illustrates how authorized systems could exchange only necessary information.'
          ],
          [
            'A careful boundary',
            'This interface provides digital service guidance only. It does not replace the legal authority or decisions of the Government of Nepal.'
          ]
        ].map(item => (
          <article key={item[0]}>
            <i>✦</i>
            <h2>{item[0]}</h2>
            <p>{item[1]}</p>
          </article>
        ))}
      </div>
    </PageTitle>
  );
}