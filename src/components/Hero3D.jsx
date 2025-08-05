import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useRef } from "react";
import gsap from "gsap";

function RotatingPlanet() {
  return (
    <mesh rotation={[0.4, 0.5, 0]}>
      <sphereGeometry args={[1.3, 32, 32]} />
      <meshStandardMaterial color="#37a2ec" roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

export default function Hero3D({ scrollToRef }) {
  const textRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.7, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800">
      <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={0.7} />
        <Stars radius={60} depth={40} count={4500} factor={3} fade speed={1} />
        <RotatingPlanet />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center text-center space-y-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-white bg-clip-text text-transparent drop-shadow-lg">
          Hi 👋, I'm Gajendra Awasthi
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-cyan-200/90">
          Student | Content Creator | Graphics Designer | Tech Geek
        </p>
        <button
          className="mt-4 px-7 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full text-lg font-semibold shadow-lg transition"
          onClick={() =>
            window.open(
              "mailto:sanuawasthi123@gmail.com?subject=Hire%20Gajendra%20Awasthi",
              "_blank"
            )
          }
        >
          Hire Me
        </button>
        <button
          className="mt-2 underline text-cyan-300 hover:text-cyan-400 text-sm"
          onClick={() => scrollToRef?.current?.scrollIntoView({ behavior: "smooth" })}
        >
          ↓ Scroll to explore
        </button>
      </div>
    </div>
  );
}