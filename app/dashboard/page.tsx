'use client';

import { ChartAreaInteractive } from '@/app/dashboard/ChartAreaInteractive';
import { DataTable } from '@/app/dashboard/DataTable';
import { SectionCards } from '@/app/dashboard/SectionCards';
import { StatsCards } from '@/app/dashboard/StatsCards';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Page() {
  const dashboardData = useQuery(api.dashboard.metrics);

  return (
    <>
      <StatsCards />
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive
          chartData={dashboardData?.chartData ?? []}
          subjectProgress={dashboardData?.subjectProgress ?? []}
        />
      </div>
      <DataTable
        data={(dashboardData?.subjectProgress ?? []).map((item: any) => ({
          ...item,
          risk: item.risk as 'on-track' | 'attention' | 'critical',
        }))}
      />
    </>
  );
}
