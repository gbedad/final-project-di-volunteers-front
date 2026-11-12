// Same groups as the server (middlewares/authAdmin.js)
export const isStaff = (role) =>
  ['superadmin', 'admin', 'interviewer'].includes(role);

// Can manage missions, delete documents and use the Team page
export const isManager = (role) => ['superadmin', 'admin'].includes(role);

// Cultural activities: the managers, and the people in charge of the
// outings (who see nothing else)
export const isCulture = (role) =>
  ['superadmin', 'admin', 'culture'].includes(role);

export const ROLE_LABELS = {
  volunteer: 'Bénévole',
  interviewer: 'Interviewer',
  culture: 'Activités culturelles',
  admin: 'Admin',
  superadmin: 'Superadmin',
};
