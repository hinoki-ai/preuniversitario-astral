'use client';

import { IconCamera, IconClock, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

type MeetingItem = any; // Using any for now - proper typing needed

export function ZoomClassesCard() {
  const meetings = useQuery(api.meetings.listUpcoming, {});

  // Get next 2 upcoming meetings
  const upcomingMeetings = meetings?.slice(0, 2) || [];
  const nextMeeting = upcomingMeetings[0];

  // Calculate stats
  const totalClasses = meetings?.length || 0;
  const liveClasses = meetings?.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return now >= m.startTime && now <= (m.startTime + 3600);
  }).length || 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Clases en Vivo (Zoom)</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {totalClasses}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className="flex items-center gap-1">
            <IconCamera className="size-3" />
            {liveClasses > 0 ? `${liveClasses} en vivo` : 'Próximas clases'}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-3 text-sm">
        {nextMeeting && (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 font-medium">
              <IconClock className="size-4" />
              Próxima clase
            </div>
            <div className="text-muted-foreground pl-6">
              {nextMeeting.title}
            </div>
            <div className="text-muted-foreground pl-6 text-xs">
              {new Date(nextMeeting.startTime * 1000).toLocaleString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {nextMeeting.myRsvp && (
              <div className="pl-6">
                <Badge variant="outline" className="text-xs">
                  <IconUsers className="size-3 mr-1" />
                  RSVP: {nextMeeting.myRsvp}
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href="/dashboard/payment-gated/zoom">
              Ver agenda completa
            </Link>
          </Button>
          {liveClasses > 0 && (
            <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Link href="/dashboard/payment-gated/zoom">
                <IconCamera className="size-3 mr-1" />
                Unirse a clase en vivo
              </Link>
            </Button>
          )}
          {nextMeeting?.meetingNumber && nextMeeting?.passcode && liveClasses === 0 && (
            <Button asChild size="sm" variant="secondary" className="flex-1">
              <Link href="/dashboard/payment-gated/zoom">
                <IconClock className="size-3 mr-1" />
                Preparar unión
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}