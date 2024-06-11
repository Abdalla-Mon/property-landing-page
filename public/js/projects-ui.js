document.addEventListener('DOMContentLoaded', async () => {
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
    // Function to fetch projects
    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const projects = await response.json();
            displayProjects(projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            displayError();
        }
    }

    // Function to display projects
    function displayProjects(projects) {
        const container = document.querySelector('.projects-container');
        container.innerHTML = ''; // Clear existing content

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');

            const imageUrl = project.images.length > 0 ? `https://www.modernlife-sa.com${project.images[0].filePath}` : 'placeholder.jpg'; // Use a placeholder if no image
            projectCard.innerHTML = `
                <a href="/projects/project.html?id=${project.id}">
                    <img src="${imageUrl}" alt="${project.projectName}">
                    <div class="card-content">
                        <h3>${project.projectName}</h3>
                        <p>${project.aboutProject.substring(0, 100)}...</p>
                    </div>
                </a>
            `;

            container.appendChild(projectCard);
        });
    }

    // Function to display an error message
    function displayError() {
        const container = document.querySelector('.projects-container');
        container.innerHTML = '<p>خطأ في تحميل المشاريع. حاول مرة أخرى لاحقًا.</p>';
    }

    // Fetch and display projects on page load
    await fetchProjects();
});
