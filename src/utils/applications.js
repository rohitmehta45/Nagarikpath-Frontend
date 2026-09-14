import api from '../services/api';

const KEY_APPS = 'databridge_applications';
const KEY_NOTIFS = 'databridge_notifications';
const KEY_AUDIT = 'databridge_audit_logs';
const KEY_GOV = 'databridge_government_notices';

const readLocal = key => {
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const asArray = value => (Array.isArray(value) ? value : []);

const mergeById = (primary, secondary) => {
  const map = new Map();
  [...asArray(primary), ...asArray(secondary)].forEach(item => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
};

const uid = prefix =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const STAGES = [
  'SUBMITTED',
  'DOCUMENT_VERIFICATION',
  'OFFICER_REVIEW',
  'ADDITIONAL_INFORMATION_REQUIRED',
  'FINAL_DECISION',
  'COMPLETED',
  'REJECTED'
];

export const statusLabel = status => ({
  SUBMITTED: 'Submitted',
  DOCUMENT_VERIFICATION: 'Document Verification',
  OFFICER_REVIEW: 'Officer Review',
  ADDITIONAL_INFORMATION_REQUIRED: 'Additional Information Required',
  FINAL_DECISION: 'Final Decision',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected'
}[status] || status);

export const nextStage = stage => {
  const index = STAGES.indexOf(stage);
  if (index === -1 || index === STAGES.length - 1) return stage;
  return STAGES[index + 1];
};

export const listApplications = () => readLocal(KEY_APPS);

export const listApplicationsForUser = userId =>
  readLocal(KEY_APPS).filter(application => application.userId === userId);

export const getApplication = id =>
  readLocal(KEY_APPS).find(application => application.id === id) || null;

export const fetchApplications = async () => {
  const local = asArray(readLocal(KEY_APPS));
  try {
    const { data } = await api.get('/applications');
    const remote = asArray(data?.applications || data);
    const merged = mergeById(remote, local);
    writeLocal(KEY_APPS, merged);
    return merged;
  } catch {
    return local;
  }
};

export const fetchUserApplications = async userId => {
  const local = asArray(readLocal(KEY_APPS)).filter(
    application => application.userId === userId
  );
  try {
    const { data } = await api.get(
      `/applications?userId=${encodeURIComponent(userId)}`
    );
    const remote = asArray(data?.applications || data);
    const merged = mergeById(remote, local);
    writeLocal(
      KEY_APPS,
      mergeById(merged, asArray(readLocal(KEY_APPS)))
    );
    return merged;
  } catch {
    return local;
  }
};

export const fetchApplication = async id => {
  if (!id) return null;
  try {
    const { data } = await api.get(
      `/applications/${encodeURIComponent(id)}`
    );
    const application = data?.application || data;
    if (application?.id) {
      const others = readLocal(KEY_APPS).filter(
        item => item.id !== application.id
      );
      writeLocal(KEY_APPS, [application, ...others]);
    }
    return application || null;
  } catch (err) {
    if (err?.status === 404) return null;
    return getApplication(id);
  }
};

/**
 * Create an application on the server.
 *
 * IMPORTANT: We do NOT write to localStorage before the server confirms.
 * That was the bug causing "citizen sees it, admin doesn't" — the citizen
 * was seeing a local phantom application that never reached MongoDB.
 */
export const createApplication = async payload => {
  const now = new Date().toISOString();
  const draft = {
    createdAt: now,
    status: 'SUBMITTED',
    history: [
      {
        stage: 'SUBMITTED',
        at: now,
        note: 'Application received by the platform.'
      }
    ],
    ...payload
  };

  // No local write — wait for the server.
  const { data } = await api.post('/applications', draft);
  const saved = data?.application || data;

  if (!saved?.id) {
    throw new Error('Server did not return an application ID');
  }

  // Only now persist locally, mirroring what the server stored.
  const localList = readLocal(KEY_APPS).filter(
    application => application.id !== saved.id
  );
  writeLocal(KEY_APPS, [saved, ...localList]);

  return saved;
};

export const updateApplication = async (id, patch) => {
  // Optimistic local merge
  const localList = readLocal(KEY_APPS);
  const mergedLocal = localList.map(application =>
    application.id === id ? { ...application, ...patch } : application
  );
  writeLocal(KEY_APPS, mergedLocal);

  try {
    const { data } = await api.patch(
      `/applications/${encodeURIComponent(id)}`,
      patch
    );
    const saved = data?.application || data;
    if (saved?.id) {
      writeLocal(
        KEY_APPS,
        localList.map(application =>
          application.id === id ? saved : application
        )
      );
      return saved;
    }
    return mergedLocal.find(application => application.id === id) || null;
  } catch (err) {
    // Roll back optimistic local change on failure.
    writeLocal(KEY_APPS, localList);
    throw err;
  }
};

export const advanceApplication = async (id, note) => {
  const application = getApplication(id);
  if (!application) return null;

  const stage = nextStage(application.status);
  const history = [
    ...(application.history || []),
    {
      stage,
      at: new Date().toISOString(),
      note: note || `Moved to ${stage}.`
    }
  ];

  return updateApplication(id, { status: stage, history });
};

export const setApplicationStatus = async (id, status, note) => {
  const application = getApplication(id);
  if (!application) return null;

  const history = [
    ...(application.history || []),
    {
      stage: status,
      at: new Date().toISOString(),
      note: note || `Status set to ${status}.`
    }
  ];

  return updateApplication(id, { status, history });
};

export const fetchNotifications = async () => {
  const local = asArray(readLocal(KEY_NOTIFS));
  try {
    const { data } = await api.get('/notifications');
    const remote = asArray(data?.notifications || data);
    const merged = mergeById(remote, local);
    writeLocal(KEY_NOTIFS, merged);
    return merged;
  } catch {
    return local;
  }
};

export const pushNotification = async payload => {
  const entry = {
    id: uid('NTF'),
    createdAt: new Date().toISOString(),
    read: false,
    ...payload
  };
  writeLocal(KEY_NOTIFS, [entry, ...readLocal(KEY_NOTIFS)]);
  try {
    const { data } = await api.post('/notifications', entry);
    return data?.notification || data || entry;
  } catch {
    return entry;
  }
};

export const markNotificationRead = async id => {
  const list = readLocal(KEY_NOTIFS).map(notification =>
    notification.id === id
      ? { ...notification, read: true }
      : notification
  );
  writeLocal(KEY_NOTIFS, list);
  try {
    await api.patch(
      `/notifications/${encodeURIComponent(id)}/read`,
      { read: true }
    );
  } catch {}
  return list;
};

export const fetchAuditLogs = async () => {
  const local = asArray(readLocal(KEY_AUDIT));
  try {
    const { data } = await api.get('/audit-logs');
    const remote = asArray(data?.logs || data);
    const merged = mergeById(remote, local);
    writeLocal(KEY_AUDIT, merged);
    return merged;
  } catch {
    return local;
  }
};

export const pushAuditLog = async payload => {
  const entry = {
    id: uid('AUD'),
    at: new Date().toISOString(),
    actor: 'SYSTEM',
    ...payload
  };
  writeLocal(KEY_AUDIT, [entry, ...readLocal(KEY_AUDIT)].slice(0, 500));
  try {
    await api.post('/audit-logs', entry);
  } catch {}
  return entry;
};

export const fetchGovernmentNotices = async () => {
  const local = asArray(readLocal(KEY_GOV));
  try {
    const { data } = await api.get('/government-notices');
    const remote = asArray(data?.notices || data);
    const merged = mergeById(remote, local);
    writeLocal(KEY_GOV, merged);
    return merged;
  } catch {
    return local;
  }
};

export const pushGovernmentNotice = async payload => {
  const entry = {
    id: uid('GOV'),
    at: new Date().toISOString(),
    acknowledged: false,
    ...payload
  };
  writeLocal(KEY_GOV, [entry, ...readLocal(KEY_GOV)]);
  try {
    const { data } = await api.post('/government-notices', entry);
    return data?.notice || data || entry;
  } catch {
    return entry;
  }
};

export const fileToDataUrl = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const seedDemoApplication = () => {
  const list = readLocal(KEY_APPS);
  const seq = String(list.length + 1).padStart(5, '0');
  const id = `CIT-2026-${seq}`;
  const now = new Date().toISOString();

  const application = {
    id,
    userId: 'demo-citizen',
    createdAt: now,
    status: 'SUBMITTED',
    service: 'new',
    serviceName: 'New Citizenship Certificate',
    applicant: {
      fullName: 'Demo Citizen',
      dob: '1995-04-12',
      gender: 'Female',
      fatherName: 'Demo Father',
      fatherDob: '1965-01-01',
      motherName: 'Demo Mother',
      motherDob: '1968-06-15',
      province: 'Bagmati',
      zone: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      ward: '5'
    },
    contact: {
      email: 'demo@example.test',
      phone: '9800000000'
    },
    uploads: { photo: '', thumb: '' },
    history: [
      {
        stage: 'SUBMITTED',
        at: now,
        note: 'Application received by the platform.'
      }
    ]
  };

  writeLocal(KEY_APPS, [application, ...list]);
  return application;
};