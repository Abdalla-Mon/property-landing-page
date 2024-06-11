import { checkAdminAuth } from "./checkAdminAuth.js";

document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();

    const projectsContainer = document.getElementById('projectsContainer');
    const loader = document.getElementById('loader');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const closeBtn = document.querySelector('.closeBtn');

    closeBtn.addEventListener('click', () => {
        alertBox.style.display = 'none';
    });

    loader.style.display = 'flex';

    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        loader.style.display = 'none';

        projects.forEach(project => {
            const card = createProjectCard(project);
            projectsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        loader.style.display = 'none';
        alertMessage.textContent = 'خطأ في تحميل المشاريع. حاول مرة أخرى لاحقًا.';
        alertBox.style.display = 'block';
    }

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = project.id;

        const formContainer = document.createElement('div');
        formContainer.classList.add('form-container');

        formContainer.innerHTML = `
            <input type="text" name="projectName" value="${project.projectName || ''}" placeholder="اسم المشروع">
            <textarea name="aboutProject" placeholder="عن المشروع">${project.aboutProject || ''}</textarea>
            <div id="editFeaturesContainer-${project.id}">
                <h3>مميزات المشروع</h3>
                ${project.features?.map(f => `
                    <div class="featureServiceContainer">
                        <input type="text" value="${f.feature}" class="feature-input">
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}
                <button type="button" class="smallBtn addFeatureBtn">اضف ميزة</button>
            </div>
            <div id="editServicesContainer-${project.id}">
                <h3>خدمات الموقع</h3>
                ${project.services?.map(s => `
                    <div class="featureServiceContainer oldservices">
                        <input type="text" value="${s.service}" class="service-input">
                        <img src="${s.image}" class="serviceImagePreview" alt="Service Image">
                      <input type="file" class="service-image hidden"  >
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}
                <button type="button" class="smallBtn addServiceBtn">اضف خدمة</button>
            </div>
            <div id="editImagesContainer-${project.id}">
                <h3>صور المشروع</h3>
                <div>${project.images?.map(i => `
                    <div class="imageContainer" data-path="${i.filePath}">
                        <img src="${i.filePath}" class="previewImage" alt="Project Image">
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}</div>
                <label for="imageInput-${project.id}" class="customFileInput smallBtn">اضف صوره<input type="file" id="imageInput-${project.id}" class="hidden"></label>
            </div>
            <h3>فيديو المشروع</h3>
            <p>الفيديو</p>
            <input type="text" name="projectVideo" value="${project.video || ''}" placeholder="رابط الفيديو">
            <div id="editUnitsContainer-${project.id}">
                <h3>وحدات المشروع</h3>
                ${project.units?.map(u => `
                    <div class="unitContainer">
                        <input type="text" value="${u.name}" placeholder="اسم الوحدة">
                        <input type="text" value="${u.size}" placeholder="الحجم">
                        <input type="number" value="${u.numberOfRooms}" placeholder="عدد الغرف">
                        <input type="number" value="${u.price}" placeholder="السعر">
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}
                <button type="button" class="smallBtn addUnitBtn">اضف وحدة</button>
            </div>
            <div class="button-container">
                <button type="button" class="saveBtn">حفظ</button>
                <button type="button" class="deleteBtn">حذف</button>
            </div>
        `;

        const editedPaths = new Set();
        let imagesArray = [];
let servicesArray=[];
        formContainer.querySelector('.addFeatureBtn').addEventListener('click', () => {
            const featureInput = document.createElement('div');
            featureInput.classList.add('featureServiceContainer');
            featureInput.innerHTML = `<input type="text" class="feature-input" placeholder="الميزه">
                                      <button type="button" class="removeBtn">X</button>`;
            formContainer.querySelector(`#editFeaturesContainer-${project.id}`).insertBefore(featureInput, formContainer.querySelector(`#editFeaturesContainer-${project.id} .addFeatureBtn`));

            featureInput.querySelector('.removeBtn').addEventListener('click', () => {
                formContainer.querySelector(`#editFeaturesContainer-${project.id}`).removeChild(featureInput);
            });
        });

        formContainer.querySelector('.addServiceBtn').addEventListener('click', () => {
            const serviceDiv = document.createElement('div');
            serviceDiv.classList.add('featureServiceContainer');
            const serviceInput = document.createElement('input');
            serviceInput.type = 'text';
            serviceInput.placeholder = 'الخدمه';
            const imagePreview = document.createElement('img');
            imagePreview.classList.add('serviceImagePreview', 'hidden');
            const customFileInput = document.createElement('label');
            customFileInput.classList.add('customFileInput');
            customFileInput.textContent = 'رفع صورة للخدمة';
            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.classList.add('hidden');
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = 'X';
            removeBtn.classList.add('removeBtn');

            serviceDiv.appendChild(serviceInput);
            serviceDiv.appendChild(imagePreview);
            serviceDiv.appendChild(customFileInput);
            serviceDiv.appendChild(imageInput);
            serviceDiv.appendChild(removeBtn);
            formContainer.querySelector(`#editServicesContainer-${project.id}`).appendChild(serviceDiv);

            servicesArray.push(serviceDiv);

            customFileInput.addEventListener('click', () => imageInput.click());

            imageInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.classList.remove('hidden');
                        customFileInput.classList.add('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });

            removeBtn.addEventListener('click', function() {
                formContainer.querySelector(`#editServicesContainer-${project.id}`).removeChild(serviceDiv);
                servicesArray = servicesArray.filter(item => item !== serviceDiv);
            });
        });

        formContainer.querySelector('.addUnitBtn').addEventListener('click', () => {
            const unitDiv = document.createElement('div');
            unitDiv.classList.add('unitContainer');
            unitDiv.innerHTML = `<input type="text" placeholder="اسم الوحدة">
                                 <input type="text" placeholder="الحجم">
                                 <input type="number" placeholder="عدد الغرف">
                                 <input type="number" placeholder="السعر">
                                 <button type="button" class="removeBtn">X</button>`;
            formContainer.querySelector(`#editUnitsContainer-${project.id}`).insertBefore(unitDiv, formContainer.querySelector(`#editUnitsContainer-${project.id} .addUnitBtn`));

            unitDiv.querySelector('.removeBtn').addEventListener('click', () => {
                formContainer.querySelector(`#editUnitsContainer-${project.id}`).removeChild(unitDiv);
            });
        });

        formContainer.querySelectorAll('.removeBtn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const imageContainer = event.target.parentElement;
                editedPaths.add(imageContainer.dataset.path);
                imageContainer.remove();
            });
        });

        formContainer.querySelector(`#imageInput-${project.id}`).addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageDiv = document.createElement('div');
                    const image = document.createElement('img');
                    const removeBtn = document.createElement('button');
                    imageDiv.classList.add('imageContainer');
                    image.src = e.target.result;
                    image.classList.add('previewImage');
                    removeBtn.type = 'button';
                    removeBtn.textContent = 'X';
                    removeBtn.classList.add('removeBtn');

                    imageDiv.appendChild(image);
                    imageDiv.appendChild(removeBtn);
                    formContainer.querySelector(`#editImagesContainer-${project.id} > div`).appendChild(imageDiv);

                    imagesArray.push(file);

                    removeBtn.addEventListener('click', function() {
                        formContainer.querySelector(`#editImagesContainer-${project.id} > div`).removeChild(imageDiv);
                        imagesArray = imagesArray.filter(item => item !== file);
                    });
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        });

        formContainer.querySelector('.saveBtn').addEventListener('click', async () => {
            await saveProject(card, formContainer, project.id, editedPaths, imagesArray, servicesArray);
        });

        formContainer.querySelector('.deleteBtn').addEventListener('click', async () => {
            console.log('Deleting project:', project.id);
            await deleteProject(card, project.id);
        });

        card.appendChild(formContainer);

        return card;
    }

    async function saveProject(card, formContainer, projectId, editedPaths, imagesArray, servicesArray) {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';

        const projectName = formContainer.querySelector('input[name="projectName"]').value;
        const aboutProject = formContainer.querySelector('textarea[name="aboutProject"]').value;
        const projectVideo = formContainer.querySelector('input[name="projectVideo"]').value;

        const projectFeatures = Array.from(formContainer.querySelectorAll('.feature-input'))?.map(input => input.value);
        const services = servicesArray.map(div => ({
            service: div.querySelector('input[type="text"]').value,
            image: div.querySelector('input[type="file"]').files[0].name,
            file:div.querySelector('input[type="file"]').files[0]
        }));
const oldServices=Array.from(formContainer.querySelectorAll('.oldservices')).map(div => ({
            service: div.querySelector('input[type="text"]').value,
            image: div.querySelector('img').src
        }));

        const units = Array.from(formContainer.querySelectorAll('.unitContainer')).map(container => ({
            name: container.querySelector('input[placeholder="اسم الوحدة"]').value,
            size: container.querySelector('input[placeholder="الحجم"]').value,
            numberOfRooms: container.querySelector('input[placeholder="عدد الغرف"]').value,
            price: container.querySelector('input[placeholder="السعر"]').value
        }));

        const formData = new FormData();
        formData.append('id', projectId);
        formData.append('projectName', projectName);
        formData.append('aboutProject', aboutProject);
        formData.append('projectFeatures', JSON.stringify(projectFeatures));
        formData.append('services', JSON.stringify([...oldServices,...services]));
        formData.append('video', projectVideo);
        formData.append('units', JSON.stringify(units));
        formData.append('editedPaths', JSON.stringify(Array.from(editedPaths)));
        services.forEach(service => {
            if (service.file) {
                formData.append('serviceImages', service.file);
            }
        });
        imagesArray.forEach(file => formData.append('files', file));
        servicesArray.forEach(serviceDiv => {
        console.log(serviceDiv,"serviceDiv")
            const imageInput = serviceDiv.querySelector('.service-image');
            if (imageInput && imageInput.files[0]) {
                formData.append('serviceImages', imageInput.files[0]);
            }
        });
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('/api/projects', {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            loader.style.display = 'none';
            if (response.ok) {
                const result = await response.json();
                alertMessage.textContent = result.message || 'تم تحديث المشروع بنجاح';
                alertBox.style.backgroundColor = '#445372';
                alertBox.style.display = 'block';

                const newCard = createProjectCard(result.project);
                projectsContainer.replaceChild(newCard, card);
            } else {
                const errorText = await response.text();
                console.error('فشل في التحديث:', errorText);
                alertMessage.textContent = 'فشل في التحديث: ' + errorText;
                alertBox.style.backgroundColor = '#d9534f';
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء التحديث:', error);
            alertMessage.textContent = 'حدث خطأ أثناء التحديث: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f';
            alertBox.style.display = 'block';
        }
    }
    async function deleteProject(card, projectId) {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            loader.style.display = 'none';
            if (response.ok) {
                card.remove();
                alertMessage.textContent = 'تم حذف المشروع بنجاح';
                alertBox.style.backgroundColor = '#445372';
                alertBox.style.display = 'block';
            } else {
                const errorText = await response.text();
                console.error('فشل في الحذف:', errorText);
                alertMessage.textContent = 'فشل في الحذف: ' + errorText;
                alertBox.style.backgroundColor = '#d9534f';
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء الحذف:', error);
            alertMessage.textContent = 'حدث خطأ أثناء الحذف: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f';
            alertBox.style.display = 'block';
        }
    }
});
