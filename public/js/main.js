document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.drawer .drawer-close');

    function toggleMenu() {
        const isOpen = drawer.classList.contains('open');
        console.log(isOpen)
        if (isOpen) {
            gsap.to(drawer, { right: "-100%", duration: 0.3,display: "none"});
            gsap.to(overlay, { opacity: 0, duration: 0.3,right: "100%",display: "none"});
        } else {
            gsap.to(drawer, { right: "0%", duration: 0.3 ,display: "flex"});
            gsap.to(overlay, { opacity: 1, duration: 0.3,right: "0%",display: "block"});
        }
        drawer.classList.toggle('open');
    }

    menuIcon.addEventListener('click', toggleMenu);
    closeIcon.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    toggleMenu();
});

