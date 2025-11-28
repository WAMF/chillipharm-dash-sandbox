import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAudqbkOI2z0uoYy3fvhA8oaYHSNYIPprs",
  authDomain: "chillipharm-dashboard.firebaseapp.com",
  projectId: "chillipharm-dashboard",
  storageBucket: "chillipharm-dashboard.firebasestorage.app",
  messagingSenderId: "336772253694",
  appId: "1:336772253694:web:d9fcc4475657f90e8722af",
  measurementId: "G-YQYHFK49EW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let analytics: Analytics | null = null;

export function initAnalytics(): Analytics | null {
  if (typeof window !== 'undefined' && !analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export function trackPageView(pageName: string): void {
  trackEvent('page_view', { page_title: pageName });
}

export function trackTabChange(tabName: string): void {
  trackEvent('tab_change', { tab_name: tabName });
}

export function trackDrillDown(category: string, label: string): void {
  trackEvent('drill_down', { category, label });
}

export function trackExport(exportType: string, recordCount: number): void {
  trackEvent('export', { export_type: exportType, record_count: recordCount });
}

export function trackFilter(filterType: string, value: string): void {
  trackEvent('filter_applied', { filter_type: filterType, value });
}

export function trackFeedback(tab: string, hasScreenshot: boolean, feedbackLength: number): void {
  trackEvent('feedback_submitted', { tab, has_screenshot: hasScreenshot, feedback_length: feedbackLength });
}
