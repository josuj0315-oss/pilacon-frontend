export const IS_EMAIL_LOGIN_ENABLED = false;

export const getOnboardingPath = (user) => {
    if (!user) return '/login';
    if (!user.nickname) return '/set-nickname';
    if (user.role === 'USER' || !user.role) return '/select-role';
    return '/';
};
