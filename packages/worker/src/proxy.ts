/**
 * Mock Google Calendar Proxy
 * Returns fake responses for testing without real API calls
 */

import { GoogleCalendarEvent } from '@agent-auth/shared';
import { generateId } from './utils';

export class MockGoogleCalendarProxy {
  /**
   * Mock: Create calendar event
   */
  async createEvent(event: GoogleCalendarEvent): Promise<Response> {
    const mockResponse = {
      kind: 'calendar#event',
      id: generateId(),
      status: 'confirmed',
      htmlLink: `https://calendar.google.com/event?eid=${generateId()}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      summary: event.summary || 'Untitled Event',
      description: event.description,
      location: event.location,
      creator: {
        email: 'agent@example.com',
        displayName: 'AI Agent',
      },
      organizer: {
        email: 'agent@example.com',
        displayName: 'AI Agent',
      },
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Mock: Update calendar event
   */
  async updateEvent(eventId: string, updates: Partial<GoogleCalendarEvent>): Promise<Response> {
    const mockResponse = {
      kind: 'calendar#event',
      id: eventId,
      status: 'confirmed',
      htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
      updated: new Date().toISOString(),
      summary: updates.summary || 'Updated Event',
      description: updates.description,
      location: updates.location,
      start: updates.start,
      end: updates.end,
      attendees: updates.attendees || [],
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Mock: Delete calendar event
   */
  async deleteEvent(eventId: string): Promise<Response> {
    return new Response(null, {
      status: 204,
    });
  }

  /**
   * Mock: List calendar events
   */
  async listEvents(): Promise<Response> {
    const mockResponse = {
      kind: 'calendar#events',
      summary: 'Primary Calendar',
      updated: new Date().toISOString(),
      timeZone: 'UTC',
      items: [
        {
          kind: 'calendar#event',
          id: generateId(),
          status: 'confirmed',
          summary: 'Team Meeting',
          start: {
            dateTime: '2025-01-15T10:00:00Z',
          },
          end: {
            dateTime: '2025-01-15T11:00:00Z',
          },
        },
        {
          kind: 'calendar#event',
          id: generateId(),
          status: 'confirmed',
          summary: '1:1 with Manager',
          start: {
            dateTime: '2025-01-16T14:00:00Z',
          },
          end: {
            dateTime: '2025-01-16T14:30:00Z',
          },
        },
      ],
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
