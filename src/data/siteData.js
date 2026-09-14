export const services = [
  {
    id: 'new',
    icon: '◈',
    name: 'New Citizenship Certificate',
    category: 'First application',
    desc: 'Guidance for a first citizenship certificate application through the competent district administration office.',
    docs: [
      'Birth registration certificate',
      'Parent citizenship certificates',
      'Local recommendation where applicable'
    ]
  },
  {
    id: 'descent',
    icon: '◎',
    name: 'Citizenship by Descent',
    category: 'Parentage',
    desc: 'For applicants seeking citizenship service guidance on the basis of parentage or descent.',
    docs: [
      'Birth registration certificate',
      'Parent citizenship certificates',
      'Relationship evidence'
    ]
  },
  {
    id: 'replacement',
    icon: '↺',
    name: 'Copy or Replacement',
    category: 'Existing certificate',
    desc: 'Replace a lost, damaged, or unavailable citizenship certificate.',
    docs: [
      'Application statement',
      'Police report if requested',
      'Available copy or identification'
    ]
  },
  {
    id: 'correction',
    icon: '✦',
    name: 'Citizenship Correction',
    category: 'Record update',
    desc: 'Request guidance for corrections to details recorded on a citizenship certificate.',
    docs: [
      'Existing citizenship certificate',
      'Evidence supporting correction',
      'Relevant civil registration record'
    ]
  },
  {
    id: 'marriage',
    icon: '∞',
    name: 'Service after Marriage',
    category: 'Family status',
    desc: 'Citizenship-related service navigation after marriage or a change in family circumstances.',
    docs: [
      'Marriage registration',
      'Existing citizenship record',
      'Supporting identity documents'
    ]
  },
  {
    id: 'verify',
    icon: '✓',
    name: 'Citizenship Verification',
    category: 'Verification',
    desc: 'Understand verification, document review, and authorized government data checks.',
    docs: [
      'Citizenship certificate copy',
      'Request letter where applicable',
      'Supporting identity record'
    ]
  }
];

export const offices = [
  ['Kathmandu District Administration Office', 'Kathmandu', '+977 01-4211000'],
  ['Lalitpur District Administration Office', 'Lalitpur', '+977 01-5521200'],
  ['Kaski District Administration Office', 'Kaski', '+977 061-465100'],
  ['Morang District Administration Office', 'Morang', '+977 021-571100']
];

export const notices = [
  ['Service guidance updated', 'General', '12 Sep 2026'],
  ['Document preparation reminder', 'Documents', '08 Sep 2026'],
  ['Dashain office-hours information', 'Office hours', '02 Sep 2026']
];

export const faqs = [
  [
    'Is this a legal citizenship issuance service?',
    'No. This academic prototype helps citizens navigate services and understand a digital workflow. The competent Government of Nepal authority makes all legal decisions.'
  ],
  [
    'Which documents will I need?',
    'Requirements depend on the service and your circumstances. Use the eligibility checker and confirm requirements with the responsible office.'
  ],
  [
    'Can I follow my application?',
    'Yes. The prototype provides a transparent, stage-based application timeline after submission.'
  ],
  [
    'How is my information handled?',
    'The platform demonstrates role-based access, minimized verification data, and an audit trail. Do not submit real sensitive personal information in this prototype.'
  ]
];

export const navigation = [
  ['Home', '/'],
  ['Services', '/services'],
  ['Eligibility', '/eligibility'],
  ['Apply', '/apply'],
  ['Track', '/track'],
  ['Offices', '/offices'],
  ['Notices', '/notices'],
  ['Help', '/faq']
];