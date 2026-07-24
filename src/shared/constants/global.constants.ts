// Business timezone
export const BUSINESS_TIMEZONE = process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE as string;

// Cookie keys
export const COOKIE_SESSION_KEY = "session";
export const THEME_COOKIE_KEY = "theme";
export const COOKIE_USER_INFO_KEY = "user-info";
export const DASHBOARD_SCREEN_KEY = "dashboard-screen";

// API routes
export const LOGIN_API_ENDPOINT = "/api";
export const FORGOT_PASSWORD_API_ENDPOINT = "/api/auth/forgot-password";
export const RESET_PASSWORD_API_ENDPOINT = "/api/auth/reset-password";
export const CREATE_USER_API_ENDPOINT = "/api/auth/create-user";
export const SIGN_OUT_API_ENDPOINT = "/api/auth/sign-out";

export const GET_QUOTE_API_ENDPOINT = "/api/quotes";
export const BALANCE_API_ENDPOINT = "/api/balance";
export const BALANCE_REQUESTS_API_ENDPOINT = "/api/balance/requests";
export const MARGIN_PROFIT_API_ENDPOINT = "/api/margin-profit";
export const ADDRESS_API_ENDPOINT = "/api/address";
export const ADDRESS_GE_API_ENDPOINT = "/api/ge-address";
export const GET_ADDRESS_INFO_API_ENDPOINT = "/api/address-info";

// Routes
export const REGISTER_ROUTE = "/register";
export const FORGOT_PASSWORD_ROUTE = "/forgot-password";
export const LOGIN_ROUTE = "/";
export const DASHBOARD_ROUTE = "/dashboard";

export const primaryButtonCSS = "relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-10 px-5 text-sm bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 hover:cursor-pointer"

export const secondaryButtonCSS = "relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-10 px-5 text-sm border border-primary-700 text-primary-700 hover:border-primary-800 hover:bg-primary-800 hover:text-white focus:ring-primary-300 dark:border-primary-600 dark:text-primary-500 dark:hover:border-primary-700 dark:hover:bg-primary-700 dark:hover:text-white dark:focus:ring-primary-800"

export const darkRedButtonCSS = "relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-10 px-5 text-sm border border-red-700 text-red-700 hover:border-red-800 hover:bg-red-800 hover:text-white focus:ring-red-300 dark:border-red-600 dark:text-red-500 dark:hover:border-red-700 dark:hover:bg-red-700 dark:hover:text-white dark:focus:ring-red-800"

export const greySecondaryCSS = "relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-10 px-5 text-sm border border-gray-600 text-gray-600 hover:border-gray-400 hover:bg-gray-200 hover:text-black focus:ring-gray-300 dark:border-gray-400 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-300 dark:hover:text-black dark:focus:ring-gray-800"
