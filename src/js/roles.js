// Same groups as the server (middlewares/authAdmin.js)
export const isStaff = (role) =>
  ['superadmin', 'admin', 'interviewer'].includes(role);

// Can manage missions, delete documents and use the Team page
export const isManager = (role) => ['superadmin', 'admin'].includes(role);

// Cultural activities: the managers, and the people in charge of the
// outings (who see nothing else): "superculture" changes every outing,
// "culture" only those it is in charge of
export const isCulture = (role) =>
  ['superadmin', 'admin', 'superculture', 'culture'].includes(role);
// Only the outings: their one page
export const isCultureOnly = (role) =>
  ['superculture', 'culture'].includes(role);

// Paid tutoring: its own managers, apart from the free tutoring (server:
// PAYANT_ROLES in middlewares/authAdmin.js)
export const isPayant = (role) => ['superadmin', 'gestion_payant'].includes(role);

export const ROLE_LABELS = {
  gestion_payant: 'Gestion tutorat payant',
  volunteer: 'Bénévole',
  interviewer: 'Interviewer',
  culture: 'Activités culturelles',
  superculture: 'Super culture',
  admin: 'Admin',
  superadmin: 'Superadmin',
};
