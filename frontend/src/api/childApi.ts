const CHILD_API_PREFIX = '/child';

export const childApi = {
  auth: {
    login: `${CHILD_API_PREFIX}/auth/login`,
  },
} as const;

export type ChildApi = typeof childApi;
