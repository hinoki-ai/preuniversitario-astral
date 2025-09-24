import Simulator from '@/components/Simulator';

export default function PaesPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Simulacros PAES</h1>
      </div>
      <Simulator />
    </div>
  );
}
