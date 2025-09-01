
import posthog from 'posthog-js';
import { env, isDevelopment } from '@/config/environment';

class AnalyticsService {
  private initialized = false;

  init() {
    if (this.initialized || !env.POSTHOG_KEY || isDevelopment) {
      return;
    }

    posthog.init(env.POSTHOG_KEY, {
      api_host: env.POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true,
      capture_pageview: true,
      disable_session_recording: false,
      person_profiles: 'identified_only',
    });

    this.initialized = true;
    console.log('📊 PostHog analytics initialized');
  }

  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.identify(userId, properties);
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture(event, properties);
  }

  page(properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture('$pageview', properties);
  }

  reset() {
    if (!this.initialized) return;
    posthog.reset();
  }

  // EOS-specific events
  trackRockCreated(rockId: string, title: string) {
    this.track('rock_created', { rock_id: rockId, title });
  }

  trackIssueCreated(issueId: string, title: string, priority: number) {
    this.track('issue_created', { issue_id: issueId, title, priority });
  }

  trackMeetingStarted(meetingId: string) {
    this.track('meeting_started', { meeting_id: meetingId });
  }

  trackKpiUpdated(kpiId: string, value: number) {
    this.track('kpi_updated', { kpi_id: kpiId, value });
  }

  trackTodoCompleted(todoId: string) {
    this.track('todo_completed', { todo_id: todoId });
  }
}

export const analytics = new AnalyticsService();
