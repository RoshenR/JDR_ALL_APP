'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Text, Center } from '@react-three/drei'
import * as THREE from 'three'

interface DiceProps {
  result: number
  isRolling: boolean
  sides: number
  color?: string
  onRollComplete?: () => void
}

function D6Mesh({ result, isRolling, color = '#dc2626', onRollComplete }: Omit<DiceProps, 'sides'>) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 })
  const [currentResult, setCurrentResult] = useState(result)
  const rollTimeRef = useRef(0)

  // Mapping des faces du d6 aux rotations
  const faceRotations: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: Math.PI / 2 },
    3: { x: -Math.PI / 2, y: 0 },
    4: { x: Math.PI / 2, y: 0 },
    5: { x: 0, y: -Math.PI / 2 },
    6: { x: Math.PI, y: 0 },
  }

  useEffect(() => {
    if (!isRolling) {
      const rotation = faceRotations[result] || faceRotations[1]
      setTargetRotation(rotation)
      setCurrentResult(result)
    }
  }, [result, isRolling])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isRolling) {
      rollTimeRef.current += delta
      // Animation de roulement
      meshRef.current.rotation.x += delta * 8 * (1 + Math.sin(rollTimeRef.current * 3))
      meshRef.current.rotation.y += delta * 6 * (1 + Math.cos(rollTimeRef.current * 2))
      meshRef.current.rotation.z += delta * 4
    } else {
      // Interpolation vers la rotation cible
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation.x,
        delta * 5
      )
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.y,
        delta * 5
      )
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        0,
        delta * 5
      )

      // Vérifier si l'animation est terminée
      const diff = Math.abs(meshRef.current.rotation.x - targetRotation.x) +
                   Math.abs(meshRef.current.rotation.y - targetRotation.y)
      if (diff < 0.01 && rollTimeRef.current > 0) {
        rollTimeRef.current = 0
        onRollComplete?.()
      }
    }
  })

  // Points pour les faces du d6
  const dotPositions: Record<number, Array<[number, number]>> = {
    1: [[0, 0]],
    2: [[-0.25, -0.25], [0.25, 0.25]],
    3: [[-0.25, -0.25], [0, 0], [0.25, 0.25]],
    4: [[-0.25, -0.25], [-0.25, 0.25], [0.25, -0.25], [0.25, 0.25]],
    5: [[-0.25, -0.25], [-0.25, 0.25], [0, 0], [0.25, -0.25], [0.25, 0.25]],
    6: [[-0.25, -0.3], [-0.25, 0], [-0.25, 0.3], [0.25, -0.3], [0.25, 0], [0.25, 0.3]],
  }

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </RoundedBox>
      {/* Faces avec points */}
      {[1, 2, 3, 4, 5, 6].map((face) => {
        const positions: Record<number, THREE.Vector3> = {
          1: new THREE.Vector3(0, 0, 0.51),
          2: new THREE.Vector3(0.51, 0, 0),
          3: new THREE.Vector3(0, 0.51, 0),
          4: new THREE.Vector3(0, -0.51, 0),
          5: new THREE.Vector3(-0.51, 0, 0),
          6: new THREE.Vector3(0, 0, -0.51),
        }
        const rotations: Record<number, THREE.Euler> = {
          1: new THREE.Euler(0, 0, 0),
          2: new THREE.Euler(0, Math.PI / 2, 0),
          3: new THREE.Euler(-Math.PI / 2, 0, 0),
          4: new THREE.Euler(Math.PI / 2, 0, 0),
          5: new THREE.Euler(0, -Math.PI / 2, 0),
          6: new THREE.Euler(0, Math.PI, 0),
        }

        return (
          <group key={face} position={positions[face]} rotation={rotations[face]}>
            {dotPositions[face].map((pos, i) => (
              <mesh key={i} position={[pos[0], pos[1], 0]}>
                <circleGeometry args={[0.08, 16]} />
                <meshBasicMaterial color="white" />
              </mesh>
            ))}
          </group>
        )
      })}
    </mesh>
  )
}

function D20Mesh({ result, isRolling, color = '#2563eb', onRollComplete }: Omit<DiceProps, 'sides'>) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rollTimeRef = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isRolling) {
      rollTimeRef.current += delta
      meshRef.current.rotation.x += delta * 10
      meshRef.current.rotation.y += delta * 8
      meshRef.current.rotation.z += delta * 6
    } else {
      // Ralentir progressivement
      meshRef.current.rotation.x *= 0.95
      meshRef.current.rotation.y *= 0.95
      meshRef.current.rotation.z *= 0.95

      if (rollTimeRef.current > 0 &&
          Math.abs(meshRef.current.rotation.x) < 0.01) {
        rollTimeRef.current = 0
        onRollComplete?.()
      }
    }
  })

  return (
    <group ref={meshRef as React.RefObject<THREE.Group>}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <Center position={[0, 0, 0.75]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.ttf"
        >
          {isRolling ? '?' : result.toString()}
        </Text>
      </Center>
    </group>
  )
}

function GenericDie({ result, isRolling, sides, color = '#059669', onRollComplete }: DiceProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rollTimeRef = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isRolling) {
      rollTimeRef.current += delta
      meshRef.current.rotation.x += delta * 8
      meshRef.current.rotation.y += delta * 6
    } else {
      meshRef.current.rotation.x *= 0.92
      meshRef.current.rotation.y *= 0.92

      if (rollTimeRef.current > 0 &&
          Math.abs(meshRef.current.rotation.x) < 0.01) {
        rollTimeRef.current = 0
        onRollComplete?.()
      }
    }
  })

  // Choisir la géométrie selon le nombre de faces
  const getGeometry = () => {
    switch (sides) {
      case 4:
        return <tetrahedronGeometry args={[0.7, 0]} />
      case 8:
        return <octahedronGeometry args={[0.7, 0]} />
      case 10:
        return <dodecahedronGeometry args={[0.6, 0]} />
      case 12:
        return <dodecahedronGeometry args={[0.6, 0]} />
      default:
        return <boxGeometry args={[0.8, 0.8, 0.8]} />
    }
  }

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        {getGeometry()}
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <Center position={[0, 0, 0]}>
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {isRolling ? '?' : result.toString()}
        </Text>
      </Center>
    </group>
  )
}

function DiceScene({ result, isRolling, sides, color, onRollComplete }: DiceProps) {
  const DiceComponent = sides === 6 ? D6Mesh : sides === 20 ? D20Mesh : GenericDie

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <DiceComponent
        result={result}
        isRolling={isRolling}
        sides={sides}
        color={color}
        onRollComplete={onRollComplete}
      />
    </>
  )
}

interface Dice3DProps {
  result: number
  isRolling: boolean
  sides?: number
  color?: string
  size?: number
  onRollComplete?: () => void
}

export function Dice3D({
  result,
  isRolling,
  sides = 6,
  color,
  size = 120,
  onRollComplete
}: Dice3DProps) {
  // Couleurs par défaut selon le type de dé
  const defaultColors: Record<number, string> = {
    4: '#f59e0b',  // Amber
    6: '#dc2626',  // Red
    8: '#059669',  // Emerald
    10: '#7c3aed', // Violet
    12: '#0891b2', // Cyan
    20: '#2563eb', // Blue
    100: '#64748b', // Slate
  }

  const diceColor = color || defaultColors[sides] || '#6366f1'

  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <Suspense fallback={null}>
          <DiceScene
            result={result}
            isRolling={isRolling}
            sides={sides}
            color={diceColor}
            onRollComplete={onRollComplete}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Dice3D
