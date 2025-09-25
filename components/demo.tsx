import { ShaderAnimation } from "@/components/ui/shader-animation";

export default function DemoOne() {
  return (
    <>
      <ShaderAnimation/>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <span className="pointer-events-none z-10 text-center text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white">
          Shader Animation
        </span>
      </div>
    </>
  )
}