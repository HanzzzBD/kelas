export default function Navigation() {
    const circleUrl = new URL(`../assets/images/additional/circle.png`, import.meta.url).href;

    const goToRoom = (event) => {
        event.preventDefault();

        if (window.location.hash === '#/' || window.location.hash === '') {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            return;
        }

        window.location.hash = '/';
    };

    return (
        <nav className="fixed w-full p-4 top-0 grid grid-cols-3 items-center font-body text-body-2 mix-blend-difference z-10">
            <a href="#/about" className="text-light nav-text justify-self-start">ABOUT</a>
            <a href="#/" onClick={goToRoom} className="flex font-head justify-center items-center gap-0.5 text-head-3 text-light tracking-widest logo-container justify-self-center" aria-label="Go to room">
                <span className="logo-text-kiri">XIP</span><img src={circleUrl} alt="" className="h-8 logo-circle" /><span className="logo-text-kanan">SEE</span>
            </a>
            <a href="#/gallery" className="text-light nav-text justify-self-end">GALLERY</a>
        </nav>
    )
}
