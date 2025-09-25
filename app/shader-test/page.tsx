import DemoOne from "@/components/demo";

export default function ShaderTestPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative z-20 p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Shader Animation Test
        </h1>
      </div>
      <DemoOne />
    </div>
  );
}