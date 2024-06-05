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
            <input type="text" name="projectName" value="${project.projectName}" placeholder="اسم المشروع" required>
            <textarea name="aboutProject" placeholder="عن المشروع" required>${project.aboutProject}</textarea>
            <div id="editFeaturesContainer-${project.id}">
                <h3>مميزات المشروع</h3>
                ${project.features.map(f => `
                    <div class="featureServiceContainer">
                        <input type="text" value="${f.feature}" class="feature-input" required>
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}
                <button type="button" class="smallBtn addFeatureBtn">اضف ميزة</button>
            </div>
            <div id="editServicesContainer-${project.id}">
                <h3>خدمات الموقع</h3>
                ${project.services.map(s => `
                    <div class="featureServiceContainer">
                        <input type="text" value="${s.service}" class="service-input" required>
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}
                <button type="button" class="smallBtn addServiceBtn">اضف خدمة</button>
            </div>
            <div id="editImagesContainer-${project.id}">
                <h3>صور المشروع</h3>
                <div>${project.images.map(i => `
                    <div class="imageContainer" data-path="${i.filePath}">
                        <img src="${i.filePath}" class="previewImage" alt="Project Image">
                        <button type="button" class="removeBtn">X</button>
                    </div>`).join('')}</div>
                <label for="imageInput-${project.id}" class="customFileInput smallBtn">اضف صوره</label>
                <input type="file" id="imageInput-${project.id}" style="display:none">
            </div>
            <h3>فيديو المشروع</h3>
            <p>الفيديو</p>
            <input type="text" name="projectVideo" value="${project.video}" placeholder="رابط الفيديو" required>
            <div class="button-container">
                <button type="button" class="saveBtn">حفظ</button>
                <button type="button" class="deleteBtn">حذف</button>
            </div>
        `;

        const editedPaths = new Set();
        let imagesArray = [];

        formContainer.querySelector('.addFeatureBtn').addEventListener('click', () => {
            const featureInput = document.createElement('div');
            featureInput.classList.add('featureServiceContainer');
            featureInput.innerHTML = `<input type="text" class="feature-input" placeholder="الميزه" required>
                                      <button type="button" class="removeBtn">X</button>`;
            formContainer.querySelector(`#editFeaturesContainer-${project.id}`).insertBefore(featureInput, formContainer.querySelector(`#editFeaturesContainer-${project.id} .addFeatureBtn`));

            featureInput.querySelector('.removeBtn').addEventListener('click', () => {
                formContainer.querySelector(`#editFeaturesContainer-${project.id}`).removeChild(featureInput);
            });
        });

        formContainer.querySelector('.addServiceBtn').addEventListener('click', () => {
            const serviceInput = document.createElement('div');
            serviceInput.classList.add('featureServiceContainer');
            serviceInput.innerHTML = `<input type="text" class="service-input" placeholder="الخدمه" required>
                                      <button type="button" class="removeBtn">X</button>`;
            formContainer.querySelector(`#editServicesContainer-${project.id}`).insertBefore(serviceInput, formContainer.querySelector(`#editServicesContainer-${project.id} .addServiceBtn`));

            serviceInput.querySelector('.removeBtn').addEventListener('click', () => {
                formContainer.querySelector(`#editServicesContainer-${project.id}`).removeChild(serviceInput);
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
            await saveProject(card, formContainer, project.id, editedPaths, imagesArray);
        });

        formContainer.querySelector('.deleteBtn').addEventListener('click', async () => {
            console.log('Deleting project:', project.id);
            await deleteProject(card, project.id);
        });

        card.appendChild(formContainer);

        return card;
    }

    async function saveProject(card, formContainer, projectId, editedPaths, imagesArray) {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';

        const projectName = formContainer.querySelector('input[name="projectName"]').value;
        const aboutProject = formContainer.querySelector('textarea[name="aboutProject"]').value;
        const projectVideo = formContainer.querySelector('input[name="projectVideo"]').value;

        const projectFeatures = Array.from(formContainer.querySelectorAll('.feature-input')).map(input => input.value);
        const locationServices = Array.from(formContainer.querySelectorAll('.service-input')).map(input => input.value);

        if (!projectName || !aboutProject || !projectVideo || projectFeatures.length === 0 || locationServices.length === 0) {
            alertMessage.textContent = 'الرجاء ملء جميع الحقول.';
            alertBox.style.backgroundColor = '#d9534f';
            alertBox.style.display = 'block';
            loader.style.display = 'none';
            return;
        }

        const formData = new FormData();
        formData.append('id', projectId);
        formData.append('projectName', projectName);
        formData.append('aboutProject', aboutProject);
        formData.append('projectFeatures', JSON.stringify(projectFeatures));
        formData.append('locationServices', JSON.stringify(locationServices));
        formData.append('video', projectVideo);
        formData.append('editedPaths', JSON.stringify(Array.from(editedPaths)));
        imagesArray.forEach(file => formData.append('files', file));

        const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

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

                // Update card content with the new data
                const newCard = createProjectCard(result.project);
                projectsContainer.replaceChild(newCard, card);
            } else {
                const errorText = await response.text();
                console.error('فشل في التحديث:', errorText);
                alertMessage.textContent = 'فشل في التحديث: ' + errorText;
                alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء التحديث:', error);
            alertMessage.textContent = 'حدث خطأ أثناء التحديث: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
            alertBox.style.display = 'block';
        }
    }

    async function deleteProject(card, projectId) {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';

        const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

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
                alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء الحذف:', error);
            alertMessage.textContent = 'حدث خطأ أثناء الحذف: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
            alertBox.style.display = 'block';
        }
    }

});
