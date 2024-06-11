document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Swiper
    var swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 40,
            },
        },
    });

    // Toggle Drawer Menu
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.drawer .drawer-close');
    const logo = document.querySelector('.navbar .logo');
    const loaderWrapper = document.getElementById('loader-wrapper');
    const loaderLogo = document.querySelector('.loader-logo');
    const header = document.querySelector('.header-absolute');
    const container = document.querySelector('.container');
    const loadingIndicator = document.querySelector('.loading-indicator');

    function toggleMenu() {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            gsap.to(drawer, { right: "-100%", duration: 0.3, display: "none" });
            gsap.to(overlay, { opacity: 0, duration: 0.3, right: "100%", display: "none" });
        } else {
            gsap.to(drawer, { right: "0%", duration: 0.3, display: "flex" });
            gsap.to(overlay, { opacity: 1, duration: 0.3, right: "0%", display: "block" });
        }
        drawer.classList.toggle('open');
    }

    menuIcon.addEventListener('click', toggleMenu);
    closeIcon.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    toggleMenu();

    // Loading Animation
    gsap.to(loaderWrapper, { y: '-100%', delay: 2, duration: 1.5, ease: "power4.inOut", onComplete: () => {
            loaderWrapper.style.display = 'none';
        }
    });

    gsap.to(loadingIndicator, {
        delay: 1.5,
        duration: 1,
        opacity: 0,
        ease: "power4.inOut"
    });

    gsap.to(loaderLogo, {
        delay: 1.5,
        duration: 1,
        transform: "none",
        width: 60,
        top: 12,
        ease: "power4.inOut",
        left: ((header.offsetWidth - container.offsetWidth) / 2) + 20,
        onComplete: () => {
            window.setTimeout(() => {
                document.body.style.overflow = 'auto';
                loaderLogo.style.display = 'none';
                logo.style.opacity = 1;
                animateHeroSection();
            }, 500);
        }
    });

    // Animate Hero Section after Loading
    function animateHeroSection() {
        gsap.to(".hero-content", {
            y: 0,
            opacity: 1,
            delay: 0.2,
            duration: 1,
            ease: "power4.out"
        });
    }

    // Scroll-based animations for other sections
    gsap.registerPlugin(ScrollTrigger);

    // Services Section Animation
    gsap.to(".services-section .title-one h3", {
        scrollTrigger: {
            trigger: ".services-section",
            start: "top 60%",
            toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out"
    });
    gsap.to(".services-section .title-one p", {
        scrollTrigger: {
            trigger: ".services-section",
            start: "top 60%",
            toggleActions: "play none none none"
        },
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out"
    });

    // Animate each service card individually
    document.querySelectorAll('.services-section .service-card').forEach((card, index) => {
        const delay = (index % 3) * 0.2;

        gsap.fromTo(card,
              {
                  y: 50,
                  opacity: 0,
              },
              {
                  scrollTrigger: {
                      trigger: card,
                      start: "top 80%",
                      toggleActions: "play none none none"
                  },
                  y: 0,
                  opacity: 1,
                  duration: 0.6,
                  ease: "power4.out",
                  delay: delay
              });
    });

    // Fetch latest projects
    async function fetchLatestProjects() {
        try {
            const response = await fetch('/api/projects/latest');
            const projects = await response.json();
            updateProjectCards(projects);
        } catch (error) {
            console.error('Error fetching latest projects:', error);
            hideProjectsSection();
        }
    }

    function showSkeletonLoader() {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        for (let i = 0; i < 5; i++) {
            const skeletonSlide = document.createElement('div');
            skeletonSlide.classList.add('swiper-slide', 'skeleton');
            skeletonSlide.style.height = '300px'; // Adjust height as needed
            swiperWrapper.appendChild(skeletonSlide);
        }
    }

    function hideSkeletonLoader() {
        const skeletons = document.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    function updateProjectCards(projects) {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        const projectsSection = document.querySelector('.projects-section');
        if (projects.length === 0) {
            projectsSection.classList.add('hidden');
            return;
        } else {
            projectsSection.classList.remove('hidden');
        }

        swiperWrapper.innerHTML = ''; // Clear existing slides

        projects.forEach((project) => {
            const imageUrl = "https://www.modernlife-sa.com"+project.images[0].filePath
            const projectSlide = document.createElement('div');
            projectSlide.classList.add('swiper-slide', 'project-card');
            projectSlide.style.backgroundImage = `url('${imageUrl}')`;

            projectSlide.innerHTML = `
                <a href="/projects/project.html?id=${project.id}">
                    <div class="card-content">
                        <h3>${project.projectName}</h3>
                        <p>${project.aboutProject.substring(0, 100)}...</p>
                    </div>
                </a>
            `;
            swiperWrapper.appendChild(projectSlide);
        });

        swiper.update(); // Update Swiper instance

        gsap.to(".projects-section .section-title", {
            scrollTrigger: {
                trigger: ".projects-section",
                start: "top 60%",
                toggleActions: "play none none none"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power4.out"
        });

        gsap.from(".projects-section .swiper-slide", {
            scrollTrigger: {
                trigger: ".projects-section",
                start: "top 60%",
                toggleActions: "play none none none"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.2
        });
    }

    function hideProjectsSection() {
        const projectsSection = document.querySelector('.projects-section');
        projectsSection.classList.add('hidden');
    }

    showSkeletonLoader();
    await fetchLatestProjects();
    hideSkeletonLoader();

    // Animate About Us Section

const aboutDetails = document.querySelectorAll("#about-us p");
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#about-us",
            start: "top 80%",
            toggleActions: "play none none none"
        }
    });
timeline.fromTo("#about-us h2", {
        y: -50,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "power4.out"
    });

    timeline.add([
        timeline.fromTo(aboutDetails[0], {
            x: 50,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            ease: "power4.out"
        })
,
    timeline.fromTo(aboutDetails[1], {
        x: -50,
        opacity: 0
    }, {
        x: 0,
        opacity: 1,
        ease: "power4.out"
    })
    ]);

    timeline.fromTo(aboutDetails[2], {
        y: 50,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        ease: "power4.out"
    });
    // document.querySelectorAll("#about-us p").forEach((p, index) => {
    //     gsap.to(p, {
    //         scrollTrigger: {
    //             trigger: p,
    //             start: "top 80%",
    //             toggleActions: "play none none none"
    //         },
    //         y: 0,
    //         opacity: 1,
    //         duration: 1,
    //         ease: "power4.out",
    //         delay: index * 0.2
    //     });
    // });
});
