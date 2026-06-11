import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import students from '../data/students.json'

gsap.registerPlugin(useGSAP)

const TILE_SIZE = 2200
const TILE_OFFSETS = [-1, 0, 1].flatMap((x) => [-1, 0, 1].map((y) => ({ x, y })))
const classPhotoLoaders = import.meta.glob('../assets/images/Class/xirpl2/*.{jpg,jpeg,png,webp}', {
    import: 'default',
    query: '?url',
})

function getStudentImageUrl(student) {
    if (student.id === 0) {
        return new URL('../assets/images/students/rima.webp', import.meta.url).href
    }

    const fileName = student.nama.toLowerCase().split(' ').join('')
    return new URL(`../assets/images/students/${fileName}.webp`, import.meta.url).href
}

function wrapMotion(motion) {
    const halfTile = TILE_SIZE / 2

    if (motion.tx > halfTile) {
        motion.tx -= TILE_SIZE
        motion.x -= TILE_SIZE
    } else if (motion.tx < -halfTile) {
        motion.tx += TILE_SIZE
        motion.x += TILE_SIZE
    }

    if (motion.ty > halfTile) {
        motion.ty -= TILE_SIZE
        motion.y -= TILE_SIZE
    } else if (motion.ty < -halfTile) {
        motion.ty += TILE_SIZE
        motion.y += TILE_SIZE
    }
}

export default function Gallery() {
    const stageRef = useRef(null)
    const fieldRef = useRef(null)
    const dragRef = useRef({ active: false, x: 0, y: 0 })
    const motionRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 })
    const [selectedId, setSelectedId] = useState(null)
    const [classPhotos, setClassPhotos] = useState([])

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
        const teacher = students.find((student) => student.id === 0)
        const studentCards = students
            .filter((student) => student.id !== 0)
            .map((student) => ({
                ...student,
                type: 'student',
                imageUrl: getStudentImageUrl(student),
            }))
        const classCards = classPhotos.map(({ imageUrl }, index) => ({
            id: `class-${index}`,
            nama: `Momen kelas ${index + 1}`,
            nickname: 'XI RPL 2',
            type: 'class',
            imageUrl,
        }))

        const angleStep = Math.PI * (3 - Math.sqrt(5))
        const orbitItems = [...studentCards, ...classCards].map((item, index) => {
            const ring = 230 + Math.sqrt(index + 1) * 102
            const angle = index * angleStep
            const isClassPhoto = item.type === 'class'
            const size = isClassPhoto ? 190 + (index % 3) * 22 : 132 + (index % 5) * 18

            return {
                ...item,
                x: Math.cos(angle) * ring,
                y: Math.sin(angle) * ring,
                size,
                rotate: ((index % 7) - 3) * 2.5,
            }
        })

        const centerItem = teacher ? {
            ...teacher,
            type: 'teacher',
            imageUrl: getStudentImageUrl(teacher),
            x: 0,
            y: 0,
            size: 260,
            rotate: 0,
        } : null

        return centerItem ? [centerItem, ...orbitItems] : orbitItems
    }, [classPhotos])

    useEffect(() => {
        let isMounted = true

        Promise.all(
            Object.entries(classPhotoLoaders).map(([path, loadPhoto], index) => (
                loadPhoto().then((imageUrl) => ({ path, imageUrl, index }))
            ))
        ).then((photos) => {
            if (!isMounted) return
            setClassPhotos(photos.sort((a, b) => a.path.localeCompare(b.path)))
        })

        return () => {
            isMounted = false
        }
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
            wrapMotion(motion)

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

    const selectedItem = galleryItems.find((item) => item.id === selectedId)

    const handleCardClick = (item) => {
        setSelectedId(item.id)
    }

    return (
        <main ref={stageRef} className="gallery-page" aria-label="Student gallery">
            <div className="gallery-field" ref={fieldRef}>
                {TILE_OFFSETS.map((tile) => (
                    <div
                        key={`${tile.x}-${tile.y}`}
                        className="gallery-tile"
                        style={{
                            '--tile-x': `${tile.x * TILE_SIZE}px`,
                            '--tile-y': `${tile.y * TILE_SIZE}px`,
                        }}
                    >
                        {galleryItems.map((item) => (
                            <button
                                key={`${tile.x}-${tile.y}-${item.id}`}
                                type="button"
                                className={`gallery-card gallery-card--${item.type}`}
                                style={{
                                    '--gallery-x': `${item.x}px`,
                                    '--gallery-y': `${item.y}px`,
                                    '--gallery-size': `${item.size}px`,
                                    '--gallery-rotate': `${item.rotate}deg`,
                                }}
                                onClick={() => handleCardClick(item)}
                                aria-label={item.nama}
                            >
                                <img src={item.imageUrl} alt="" draggable="false" loading={item.type === 'teacher' && tile.x === 0 && tile.y === 0 ? 'eager' : 'lazy'} />
                                <span>{item.nickname}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            <div className="gallery-meta" aria-live="polite">
                <span>GALLERY</span>
                <strong>{selectedItem ? selectedItem.nama : 'XI RPL 2'}</strong>
            </div>
        </main>
    )
}
