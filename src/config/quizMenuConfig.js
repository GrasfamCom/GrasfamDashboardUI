/**
 * quizMenuConfig.js
 *
 * Single source of truth for the Quiz module's menu structure and role permissions.
 * Open/Closed principle: adding a new menu item requires ONLY a new entry here —
 * no changes to any component or guard logic.
 *
 * Roles: "Guest" | "User" | "Admin" | "MasterAdmin"
 */

export const QUIZ_ROLES = {
  GUEST: "Guest",
  USER: "User",
  ADMIN: "Admin",
  MASTER_ADMIN: "MasterAdmin",
};

const ALL_ROLES = [
  QUIZ_ROLES.GUEST,
  QUIZ_ROLES.USER,
  QUIZ_ROLES.ADMIN,
  QUIZ_ROLES.MASTER_ADMIN,
];

const USER_AND_ABOVE = [
  QUIZ_ROLES.USER,
  QUIZ_ROLES.ADMIN,
  QUIZ_ROLES.MASTER_ADMIN,
];

const ADMIN_AND_ABOVE = [
  QUIZ_ROLES.ADMIN,
  QUIZ_ROLES.MASTER_ADMIN,
];

const MASTER_ADMIN_ONLY = [QUIZ_ROLES.MASTER_ADMIN];

/**
 * @typedef {Object} QuizMenuItem
 * @property {string} menuName      - Matches the MenuName from the database seed / cookie
 * @property {string} path          - Full URL path
 * @property {string} icon          - Unicode emoji used as icon (no external icon library)
 * @property {string} label         - Display label shown in UI
 * @property {string[]} allowedRoles - Roles that may access this route
 * @property {QuizMenuItem[]} children - Nested menu items (optional)
 */

/** @type {QuizMenuItem[]} */
export const quizMenuConfig = [
  {
    menuName: "StartQuiz",
    path: "/Quiz/StartQuiz",
    icon: "▶️",
    label: "Start Quiz",
    allowedRoles: ALL_ROLES,
    children: [],
  },
  {
    menuName: "BrowseQuiz",
    path: "/Quiz/BrowseQuiz",
    icon: "🔍",
    label: "Browse Quizzes",
    allowedRoles: ALL_ROLES,
    children: [],
  },
  {
    menuName: "Learn",
    path: "/Quiz/Learn",
    icon: "📚",
    label: "Learn",
    allowedRoles: ALL_ROLES,
    children: [
      {
        menuName: "Mathematics",
        path: "/Quiz/Learn/Mathematics",
        icon: "➗",
        label: "Mathematics",
        allowedRoles: ALL_ROLES,
        children: [],
      },
      {
        menuName: "Physics",
        path: "/Quiz/Learn/Physics",
        icon: "⚛️",
        label: "Physics",
        allowedRoles: ALL_ROLES,
        children: [],
      },
      {
        menuName: "Biology",
        path: "/Quiz/Learn/Biology",
        icon: "🧬",
        label: "Biology",
        allowedRoles: ALL_ROLES,
        children: [],
      },
      {
        menuName: "English",
        path: "/Quiz/Learn/English",
        icon: "🔤",
        label: "English",
        allowedRoles: ALL_ROLES,
        children: [],
      },
    ],
  },
  {
    menuName: "MyResults",
    path: "/Quiz/MyResults",
    icon: "📊",
    label: "My Results",
    allowedRoles: USER_AND_ABOVE,
    children: [],
  },
  {
    menuName: "Reports",
    path: "/Quiz/Reports",
    icon: "📈",
    label: "Reports",
    allowedRoles: USER_AND_ABOVE,
    children: [
      {
        menuName: "Leaderboard",
        path: "/Quiz/Reports/Leaderboard",
        icon: "🏆",
        label: "Leaderboard",
        allowedRoles: USER_AND_ABOVE,
        children: [],
      },
      {
        menuName: "Results",
        path: "/Quiz/Reports/Results",
        icon: "📝",
        label: "Results",
        allowedRoles: ADMIN_AND_ABOVE,
        children: [],
      },
      {
        menuName: "Analytics",
        path: "/Quiz/Reports/Analytics",
        icon: "📉",
        label: "Analytics",
        allowedRoles: ADMIN_AND_ABOVE,
        children: [],
      },
    ],
  },
  {
    menuName: "Designer",
    path: "/Quiz/Designer",
    icon: "🎨",
    label: "Designer",
    allowedRoles: ADMIN_AND_ABOVE,
    children: [
      {
        menuName: "ListQuiz",
        path: "/Quiz/Designer/ListQuiz",
        icon: "📋",
        label: "Quiz List",
        allowedRoles: ADMIN_AND_ABOVE,
        children: [],
      },
      {
        menuName: "CreateQuiz",
        path: "/Quiz/Designer/CreateQuiz",
        icon: "➕",
        label: "Create Quiz",
        allowedRoles: ADMIN_AND_ABOVE,
        children: [],
      },
      {
        menuName: "QuestionBank",
        path: "/Quiz/Designer/QuestionBank",
        icon: "🏦",
        label: "Question Bank",
        allowedRoles: ADMIN_AND_ABOVE,
        children: [],
      },
    ],
  },
  {
    menuName: "Participants",
    path: "/Quiz/Participants",
    icon: "👥",
    label: "Participants",
    allowedRoles: ADMIN_AND_ABOVE,
    children: [],
  },
  {
    menuName: "Categories",
    path: "/Quiz/Categories",
    icon: "🏷️",
    label: "Categories",
    allowedRoles: ADMIN_AND_ABOVE,
    children: [],
  },
  {
    menuName: "Configuration",
    path: "/Quiz/Configuration",
    icon: "⚙️",
    label: "Configuration",
    allowedRoles: MASTER_ADMIN_ONLY,
    children: [],
  },
];

/**
 * Returns a flat list of all menu items (including children) for lookup.
 * @returns {QuizMenuItem[]}
 */
export const flattenMenuConfig = () => {
  const result = [];
  const flatten = (items) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children?.length > 0) {
        flatten(item.children);
      }
    });
  };
  flatten(quizMenuConfig);
  return result;
};

/**
 * Find a menu item config by its path.
 * @param {string} path
 * @returns {QuizMenuItem | undefined}
 */
export const findMenuByPath = (path) => {
  return flattenMenuConfig().find((item) => item.path === path);
};
