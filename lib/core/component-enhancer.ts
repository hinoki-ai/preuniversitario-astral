/**
 * Component Enhancement Registry
 * Batch enhances multiple components with error handling
 */

import { withMinimalErrorHandling } from './auto-error-enhancement';

// List of components that need error handling enhancement
const COMPONENTS_TO_ENHANCE = [
  'FeaturesSection',
  'PricingSection', 
  'TestimonialsSection',
  'ContactSection',
  'StatsSection',
  'Footer',
  'Newsletter',
  'YouTubePlayer',
  'FormNewsletter',
  'PaymentGate',
  'EnergyOrb',
  'Background',
  'Logo',
  'ModeToggle',
  'CustomClerkPricing',
  'ThemeProvider',
  'ConvexClientProvider',
];

// Components that require async error handling
const ASYNC_COMPONENTS = [
  'InlineQuiz',
  'StudyPlanTable', 
  'ProgressOverview',
  'CapsulePlayer',
  'Simulator',
  'ZoomClassesCard',
];

// Dashboard components
const DASHBOARD_COMPONENTS = [
  'AppSidebar',
  'NavMain',
  'NavSecondary',
  'NavUser',
  'NavDocuments',
  'SiteHeader',
  'DataTable',
  'ChartAreaInteractive',
  'StatsCards',
  'SectionCards',
  'LoadingBar'
];

// Zoom components  
const ZOOM_COMPONENTS = [
  'BasicSchedule',
  'TeacherPanel', 
  'ZoomDashboard',
  'ZoomJoinClient'
];

/**
 * Apply error handling to a component dynamically
 */
export function applyErrorHandling<T extends React.ComponentType<any>>(
  Component: T, 
  componentName: string,
  options: {
    showFallback?: boolean;
    customFallback?: React.ReactNode;
    logErrors?: boolean;
  } = {}
): T {
  return withMinimalErrorHandling(Component, {
    componentName,
    showFallback: true,
    logErrors: true,
    ...options
  }) as T;
}

/**
 * Check if component needs error handling enhancement
 */
export function needsErrorHandling(componentName: string): boolean {
  return [
    ...COMPONENTS_TO_ENHANCE,
    ...ASYNC_COMPONENTS,
    ...DASHBOARD_COMPONENTS,
    ...ZOOM_COMPONENTS
  ].includes(componentName);
}

/**
 * Get component category for appropriate error handling
 */
export function getComponentCategory(componentName: string): string {
  if (ASYNC_COMPONENTS.includes(componentName)) return 'async';
  if (DASHBOARD_COMPONENTS.includes(componentName)) return 'dashboard';
  if (ZOOM_COMPONENTS.includes(componentName)) return 'zoom';
  return 'ui';
}

export {
  COMPONENTS_TO_ENHANCE,
  ASYNC_COMPONENTS, 
  DASHBOARD_COMPONENTS,
  ZOOM_COMPONENTS
};