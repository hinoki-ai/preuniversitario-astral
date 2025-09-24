import { ChartAreaInteractive } from '@/app/dashboard/ChartAreaInteractive';
import { DataTable } from '@/app/dashboard/DataTable';
import { SectionCards } from '@/app/dashboard/SectionCards';

import data from './data.json';

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
