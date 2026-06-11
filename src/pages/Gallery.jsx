import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import students from '../data/students.json'

gsap.registerPlugin(useGSAP)

function getStudentImageUrl(name) {
    const fileName = name.toLowerCase().split(' ').join('')
    return new URL(`../assets/images/students/${fileName}.webp`, import.meta.url).href
}

export default function Gallery() {
    const stageRef = useRef(null)
    const fieldRef = useRef(null)
    const dragRef = useRef({ active: false, x: 0, y: 0 })
    const motionRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 })
    const [selectedId, setSelectedId] = useState(null)

    useGSAP(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

        intro.fromTo(
            ['.gallery-intro__eyebrow', '.gallery-intro h1', '.gallery-intro__copy', '.gallery-intro__hint'],
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1, clearProps: 'opacity,visibility,transform' }
        )

        intro.fromTo(
            '.gallery-card',
            { autoAlpha: 0, scale: 0.82 },
            { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.025, clearProps: 'opacity,visibility,transform' },
            '-=0.45'
        )

        intro.fromTo(
            '.gallery-meta',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.7, clearProps: 'opacity,visibility,transform' },
            '-=0.6'
        )
    }, { scope: stageRef })

    const galleryItems = useMemo(() => {
        const angleStep = Math.PI * (3 - Math.sqrt(5))

        return students
            .filter((student) => student.id !== 0)
            .map((student, index) => {
                const ring = 180 + Math.sqrt(index + 1) * 118
                const angle = index * angleStep
                const size = 132 + (index % 5) * 18

                return {
                    ...student,
                    imageUrl: getStudentImageUrl(student.nama),
                    x: Math.cos(angle) * ring,
                    y: Math.sin(angle) * ring,
                    size,
                    rotate: ((index % 7) - 3) * 2.5,
                }
            })
    }, [])

    useEffect(() => {
        const stage = stageRef.current
        const field = fieldRef.current
        if (!stage || !field) return

        let animationFrame = 0

        const update = () => {
            const motion = motionRef.current

            motion.x += (motion.tx - motion.x) * 0.1
            motion.y += (motion.ty - motion.y) * 0.1
            motion.tx += motion.vx
            motion.ty += motion.vy
            motion.vx *= 0.92
            motion.vy *= 0.92

            field.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0)`
            animationFrame = requestAnimationFrame(update)
        }

        const handlePointerDown = (event) => {
            dragRef.current = { active: true, x: event.clientX, y: event.clientY }
            motionRef.current.vx = 0
            motionRef.current.vy = 0
            stage.setPointerCapture(event.pointerId)
            stage.classList.add('is-dragging')
        }

        const handlePointerMove = (event) => {
            const drag = dragRef.current
            if (!drag.active) return

            const dx = event.clientX - drag.x
            const dy = event.clientY - drag.y
            const motion = motionRef.current

            motion.tx += dx
            motion.ty += dy
            motion.vx = dx * 0.22
            motion.vy = dy * 0.22
            drag.x = event.clientX
            drag.y = event.clientY
        }

        const endDrag = (event) => {
            dragRef.current.active = false
            if (stage.hasPointerCapture(event.pointerId)) {
                stage.releasePointerCapture(event.pointerId)
            }
            stage.classList.remove('is-dragging')
        }

        animationFrame = requestAnimationFrame(update)
        stage.addEventListener('pointerdown', handlePointerDown)
        stage.addEventListener('pointermove', handlePointerMove)
        stage.addEventListener('pointerup', endDrag)
        stage.addEventListener('pointercancel', endDrag)

        return () => {
            cancelAnimationFrame(animationFrame)
            stage.removeEventListener('pointerdown', handlePointerDown)
            stage.removeEventListener('pointermove', handlePointerMove)
            stage.removeEventListener('pointerup', endDrag)
            stage.removeEventListener('pointercancel', endDrag)
        }
    }, [])

    const selectedStudent = galleryItems.find((student) => student.id === selectedId)

    return (
        <main ref={stageRef} className="gallery-page" aria-label="Student gallery">
            <div className="gallery-field" ref={fieldRef}>
                {galleryItems.map((student) => (
                    <button
                        key={student.id}
                        type="button"
                        className="gallery-card"
                        style={{
                            '--gallery-x': `${student.x}px`,
                            '--gallery-y': `${student.y}px`,
                            '--gallery-size': `${student.size}px`,
                            '--gallery-rotate': `${student.rotate}deg`,
                            backgroundImage: `url(${student.imageUrl})`,
                        }}
                        onClick={() => setSelectedId(student.id)}
                        aria-label={student.nama}
                    >
                        <span>{student.nickname}</span>
                    </button>
                ))}
            </div>
            <div className="gallery-meta" aria-live="polite">
                <span>GALLERY</span>
                <strong>{selectedStudent ? selectedStudent.nama : 'XI RPL 2'}</strong>
            </div>
        </main>
    )
}
