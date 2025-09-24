import StudyPlanTable from '@/components/StudyPlanTable';

export default function StudyPlanPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plan de Estudio</h1>
      </div>
      <StudyPlanTable />
    </div>
  );
}
