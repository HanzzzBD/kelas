import { useEffect, useState } from 'react';
import Navigation from './pages/Navigation';
import Hero from './pages/Hero';
import Room from './pages/Room';
import Gallery from './pages/Gallery';
import StudentProfile from './pages/StudentProfile';
import ClassProfile from './pages/ClassProfile';
import Prestasi from './pages/Prestasi';
import data from './data/students.json';
import prestasiData from './data/prestasi.json';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

function preventDefault(e) {
  e.preventDefault();
}

function preventKeyScroll(e) {
  const keys = [' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
  if (keys.includes(e.key)) {
    e.preventDefault();
  }
}

function disableScroll() {
  window.addEventListener('wheel', preventDefault, { passive: false });
  window.addEventListener('touchmove', preventDefault, { passive: false });
  window.addEventListener('keydown', preventKeyScroll, { passive: false });
}

function enableScroll() {
  window.removeEventListener('wheel', preventDefault);
  window.removeEventListener('touchmove', preventDefault);
  window.removeEventListener('keydown', preventKeyScroll);
}

function cleanupRouteState() {
  enableScroll();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
  gsap.killTweensOf([
    '.intro-blackout',
    '.logo-circle',
    '.logo-text-kiri',
    '.logo-text-kanan',
    '.nav-text',
  ]);
}

function getRoute() {
  const hash = window.location.hash;

  if (hash.startsWith('#/about')) return 'about';
  if (hash.startsWith('#/gallery')) return 'gallery';

  return 'room';
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const isRoomRoute = route === 'room';
  const isAboutRoute = route === 'about';

  useEffect(() => {
    const updateRoute = () => {
      cleanupRouteState();
      setRoute(getRoute());
    };

    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.set('.intro-blackout', { opacity: route === 'room' ? 1 : 0, pointerEvents: route === 'room' ? 'auto' : 'none' });
    gsap.set('.app-container', { backgroundColor: route === 'gallery' ? '#171512' : '#f3eadc' });
  }, [route]);

  useGSAP(() => {
    if (isRoomRoute) {
      disableScroll();
      gsap.set('.intro-blackout', { opacity: 1, pointerEvents: 'auto' });

      let splitLogoTextKiri = SplitText.create('.logo-text-kiri', {
        type: 'words, chars',
        wordsClass: 'overflow-hidden whitespace-nowrap'
      });
      let splitLogoTextKanan = SplitText.create('.logo-text-kanan', {
        type: 'words, chars',
        wordsClass: 'overflow-hidden whitespace-nowrap'
      });

      let introTl = gsap.timeline();

      introTl.from('.logo-circle', {
        delay: 0.3,
        ease: 'power2.out',
        duration: 0.6,
        yPercent: 550,
        rotate: 360
      });
      introTl.from(splitLogoTextKiri.chars, {
        mask: 'words',
        ease: 'expo.out',
        yPercent: 100,
        duration: 1,
        rotate: 5,
        stagger: .04
      }, '<.5')
      introTl.from(splitLogoTextKanan.chars, {
        mask: 'words',
        ease: 'expo.out',
        yPercent: -100,
        duration: 1,
        rotate: 5,
        stagger: .04
      }, '<.3')
      introTl.to('.logo-circle', {
        yPercent: -10
      }, '<')
      introTl.to(splitLogoTextKiri.chars[1], {
        rotate: 360,
        ease: 'power1.out',
      }, '<.3')
      introTl.to(splitLogoTextKanan.chars[1], {
        rotate: 360,
        ease: 'power1.out',
      }, '<.15')
      introTl.from('.logo-container', {
        scale: 2.5,
        y: () => (window.innerHeight / 2) - 32,
        duration: 1.2,
        ease: 'power3.inOut'
      }, '<.3');
      introTl.from('.nav-text', {
        duration: 1,
        ease: 'power2.inOut',
        opacity: 0
      })
      introTl.to('.intro-blackout', {
        opacity: 0,
        ease: 'power2.inOut',
        pointerEvents: 'none',
        duration: 1,
        onComplete: () => enableScroll()
      }, '<')

      return () => enableScroll();
    }

    enableScroll();
    gsap.set('.intro-blackout', { opacity: 0, pointerEvents: 'none' });

    if (!isAboutRoute) {
      return () => enableScroll();
    }

    const students = document.querySelector('.students');
    if (!students) {
      return () => enableScroll();
    }

    let studentsWidth = students.offsetWidth;
    let studentsAmountToScroll = studentsWidth - window.innerWidth;
    const studentItems = document.querySelectorAll('.student-item');
    let splitRplDua = SplitText.create('.rpl-dua', {
      type: 'lines, words, chars',
      linesClass: 'overflow-hidden whitespace-nowrap'
    });
    let splitRplParagraf = SplitText.create('.rpl-paragraf', {
      type: 'lines, words',
      linesClass: 'overflow-hidden whitespace-nowrap'
    });
    let splitPrestasiBigText = SplitText.create('.prestasi-big-text', {
      type: 'words, chars',
      wordsClass: 'overflow-hidden whitespace-nowrap',
      charsClass: 'char'
    })

    gsap.set(studentItems, { opacity: 0, scale: 0.7, top: 60 });
    gsap.set('.app-container', { backgroundColor: '#f3eadc' });
    gsap.set('.instruction-text', { opacity: 0 });
    gsap.set('.bg-students', { opacity: 0, left: 1400 });

    const tween = gsap.to(students, {
      x: -studentsAmountToScroll,
      duration: 3,
      ease: 'none'
    });

    ScrollTrigger.create({
      trigger: students,
      start: 'top top',
      end: '+=' + studentsAmountToScroll,
      pin: true,
      animation: tween,
      scrub: 1,
      onEnter: () => gsap.to(['.bg-students', '.instruction-text'], { opacity: 1, duration: .5 }),
      onLeave: () => gsap.to('.instruction-text', { opacity: 0, duration: .5 })
    });

    gsap.to('.bg-students', {
      x: -studentsAmountToScroll * 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: students,
        start: 'top top',
        end: '+=' + studentsAmountToScroll,
        scrub: 1,
        containerAnimation: tween
      }
    });

    gsap.to('.app-container', {
      backgroundColor: '#171512',
      ease: 'none',
      scrollTrigger: {
        trigger: '.class-profile',
        start: 'top 50%',
        end: '50% bottom',
        scrub: 1
      }
    })

    gsap.from('.rpl-letter', {
      clipPath: 'inset(50% 0%)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.class-profile',
        start: '40% 50%',
        end: '50% bottom',
        scrub: 1,
      }
    });

    gsap.from(splitRplDua.chars, {
      delay: .3,
      duration: 1,
      ease: 'expo.out',
      yPercent: 100,
      stagger: 0.1,
      mask: 'lines',
      scrollTrigger: {
        trigger: '.class-profile',
        start: 'top 50%',
        end: '50% bottom'
      }
    })

    gsap.from(splitRplParagraf.words, {
      delay: 0.5,
      duration: 0.8,
      ease: 'power3.out',
      yPercent: 100,
      rotate: 2,
      stagger: 0.03,
      scrollTrigger: {
        trigger: '.class-profile',
        start: 'top 50%',
        end: '50% bottom'
      }
    });

    gsap.from('.prestasi-ganjil', {
      opacity: 0,
      xPercent: 200,
      ease: 'power2.inOut',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.prestasi-container',
        start: '-30% top',
        end: 'top 50%',
      }
    })

    gsap.from('.prestasi-genap', {
      opacity: 0,
      xPercent: -200,
      ease: 'power2.inOut',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.prestasi-container',
        start: '-30% top',
        end: 'top 50%',
      }
    })

    gsap.from(splitPrestasiBigText.chars, {
      delay: .3,
      duration: 1,
      ease: 'expo.out',
      yPercent: 100,
      stagger: 0.1,
      mask: 'lines',
      scrollTrigger: {
        trigger: '.prestasi-container',
        start: '-30% top',
        end: 'top 50%',
      }
    })

    gsap.to(splitPrestasiBigText.words[0].querySelectorAll('.char'), {
      rotateX: 360,
      duration: 2,
      ease: 'expo.out',
      repeat: -1,
      repeatDelay: 3.5,
      stagger: 0.05
    })

    gsap.to(splitPrestasiBigText.words[1].querySelectorAll('.char'), {
      rotateX: 360,
      duration: 2,
      ease: 'expo.out',
      repeat: -1,
      repeatDelay: 3.5,
      stagger: 0.05,
      delay: 2.4
    })

    studentItems.forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        top: 0,
        scale: 1,
        scrollTrigger: {
          trigger: item,
          start: 'left 80%',
          end: 'center 70%',
          scrub: true,
          containerAnimation: tween
        }
      })
    })

    return () => enableScroll();
  }, { dependencies: [route], revertOnUpdate: true })

  return (
    <div className='min-h-svh w-full overflow-x-hidden bg-light app-container'>
      <div className='w-full h-full bg-dark fixed inset-0 z-9 intro-blackout'></div>
      <Navigation currentRoute={route} />
      {isRoomRoute ? (
        <Room />
      ) : route === 'gallery' ? (
        <Gallery />
      ) : (
        <>
          <Hero />
          <StudentProfile data={data} />
          <ClassProfile />
          <Prestasi data={prestasiData} />
        </>
      )}
    </div>
  )
}

export default App


















