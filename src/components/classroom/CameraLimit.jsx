import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { ROOM_BOUNDS } from './sceneConfig'

export function CameraLimit({ bounds = ROOM_BOUNDS }) {
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    camera.position.set(
      MathUtils.clamp(camera.position.x, bounds.x[0], bounds.x[1]),
      MathUtils.clamp(camera.position.y, bounds.y[0], bounds.y[1]),
      MathUtils.clamp(camera.position.z, bounds.z[0], bounds.z[1]),
    )
  })

  return null
}
