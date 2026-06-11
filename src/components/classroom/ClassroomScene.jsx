import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { SRGBColorSpace } from 'three'
import { CameraLimit } from './CameraLimit'
import {
  CAMERA_POSITION,
  CAMERA_TARGET,
  MODEL_PATH,
  MODEL_POSITION,
  MODEL_SCALE,
  ROOM_BOUNDS,
} from './sceneConfig'

function ClassroomModel() {
  const { scene } = useGLTF(MODEL_PATH)
  const classroom = useMemo(() => scene.clone(true), [scene])

  useMemo(() => {
    classroom.traverse((child) => {
      if (!child.isMesh) return
      child.receiveShadow = true
      child.castShadow = false

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material?.map) {
          material.map.colorSpace = SRGBColorSpace
        }
      })
    })
  }, [classroom])

  return <primitive object={classroom} position={MODEL_POSITION} scale={MODEL_SCALE} />
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="classroom-loader" role="status" aria-live="polite">
        Loading classroom
      </div>
    </Html>
  )
}

function useMobileControls() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const update = () => setIsMobile(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}

export function ClassroomScene({ preview = false }) {
  const isMobile = useMobileControls()

  return (
    <Canvas
      camera={{ position: CAMERA_POSITION, fov: isMobile ? 62 : 56, near: 0.1, far: 80 }}
      dpr={preview ? [0.75, 1] : [1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows={false}
    >
      <color attach="background" args={['#111318']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.15} />
      <Suspense fallback={<LoadingFallback />}>
        <ClassroomModel />
      </Suspense>
      {!preview && (
        <>
          <OrbitControls
            target={CAMERA_TARGET}
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            enableZoom
            minDistance={1}
            maxDistance={1.4}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.05}
            rotateSpeed={isMobile ? 0.45 : 0.7}
            zoomSpeed={0.65}
          />
          <CameraLimit bounds={ROOM_BOUNDS} />
        </>
      )}
    </Canvas>
  )
}

useGLTF.preload(MODEL_PATH)
