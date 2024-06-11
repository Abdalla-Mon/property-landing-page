document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

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
            }, 500);
        }
    });

    if (!projectId) {
        console.error('No project ID specified');
        return;
    }

    async function fetchProjectById(id) {
        try {
            const response = await fetch(`/api/projects/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching project:', error);
            return null;
        }
    }

    function displayProject(project) {
        const mainSliderWrapper = document.getElementById('main-slider-wrapper');
        const thumbSliderWrapper = document.getElementById('thumb-slider-wrapper');
        const projectName = document.getElementById('project-name');
        const projectDescription = document.getElementById('project-description');
        const projectFeatures = document.getElementById('project-features');
        const projectServices = document.getElementById('project-services');
        const projectVideo = document.getElementById('project-video');

        project.images.forEach((image, index) => {
            const imageUrl = `https://www.modernlife-sa.com${image.filePath}`;

            // Main slider slide
            const mainSlide = document.createElement('div');
            mainSlide.classList.add('swiper-slide');
            mainSlide.innerHTML = `<img src="${imageUrl}" alt="${project.projectName}">`;
            mainSliderWrapper.appendChild(mainSlide);

            // Thumbnail slider slide
            const thumbSlide = document.createElement('div');
            thumbSlide.classList.add('swiper-slide');
            thumbSlide.innerHTML = `<img src="${imageUrl}" alt="${project.projectName}">`;
            thumbSliderWrapper.appendChild(thumbSlide);
        });

        // Add video outside the slider
        if (project.video) {
            projectVideo.innerHTML = `<iframe width="560" height="315" src="${project.video}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }

        // Initialize Swiper
        const thumbSlider = new Swiper('.thumb-slider', {
            spaceBetween: 10,
            slidesPerView: 5,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
        });

        const mainSlider = new Swiper('.main-slider', {
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: thumbSlider,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

        // Display project information
        projectName.textContent = project.projectName;
        projectDescription.textContent = project.aboutProject;

        const featuresHeading = document.createElement('h2');
        featuresHeading.textContent = 'المميزات';
        projectFeatures.appendChild(featuresHeading);

        project.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.classList.add('feature-item');
            featureItem.innerHTML = `<p>${feature.feature}</p>`;
            projectFeatures.appendChild(featureItem);
        });

        const servicesHeading = document.createElement('h2');
        servicesHeading.textContent = 'الخدمات';
        projectServices.appendChild(servicesHeading);

        project.services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.classList.add('service-item');
            serviceItem.innerHTML = `<p>${service.service}</p>`;
            projectServices.appendChild(serviceItem);
        });
    }

    const project = await fetchProjectById(projectId);
    if (project) {
        displayProject(project);
    } else {
        console.error('Project not found');
    }
});
