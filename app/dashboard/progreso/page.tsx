import ProgressOverview from '@/components/ProgressOverview';

export default function ProgresoPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progreso</h1>
      </div>
      <ProgressOverview />
    </div>
  );
}
