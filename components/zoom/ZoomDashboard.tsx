'use client';

import { useState } from 'react';

import { Card } from '@/components/ui/card';
import BasicSchedule from '@/components/zoom/BasicSchedule';
import TeacherPanel from '@/components/zoom/TeacherPanel';
import ZoomJoinClient from '@/components/zoom/ZoomJoinClient';

type Selected = {
  meetingNumber?: string;
  passcode?: string;
};

export default function ZoomDashboard() {
  const [selected, setSelected] = useState<Selected | null>(null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4 space-y-3">
            <div>
              <div className="text-base font-semibold">Agenda de Clases</div>
              <div className="text-sm text-muted-foreground">
                Selecciona una clase para autocompletar el formulario de Zoom.
              </div>
            </div>
            <BasicSchedule
              onPick={m => setSelected({ meetingNumber: m.meetingNumber, passcode: m.passcode })}
            />
          </Card>
          <TeacherPanel />
        </div>
        <div>
          <ZoomJoinClient
            initialMeetingNumber={selected?.meetingNumber}
            initialPasscode={selected?.passcode}
          />
        </div>
      </div>
    </div>
  );
}
