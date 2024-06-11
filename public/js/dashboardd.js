import { checkAdminAuth } from "./checkAdminAuth.js";

document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();

    const featuresContainer = document.getElementById('featuresContainer');
    const servicesContainer = document.getElementById('servicesContainer');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const imageInput = document.getElementById('imageInput');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const closeBtn = document.querySelector('.closeBtn');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    const unitsContainer = document.getElementById('unitsContainer');
    const addUnitBtn = document.getElementById('addUnitBtn');

    let featuresArray = [];
    let servicesArray = [];
    let imagesArray = [];
    let unitsArray = [];

    addFeatureBtn.addEventListener('click', function() {
        const featureDiv = document.createElement('div');
        const featureInput = document.createElement('input');
        const removeBtn = document.createElement('button');

        featureDiv.classList.add('featureServiceContainer');
        featureInput.type = 'text';
        featureInput.placeholder = 'الميزه';
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.classList.add('removeBtn');

        featureDiv.appendChild(featureInput);
        featureDiv.appendChild(removeBtn);
        featuresContainer.appendChild(featureDiv);

        featuresArray.push(featureDiv);

        removeBtn.addEventListener('click', function() {
            featuresContainer.removeChild(featureDiv);
            featuresArray = featuresArray.filter(item => item !== featureDiv);
        });
    });

    addServiceBtn.addEventListener('click', function() {
        const serviceDiv = document.createElement('div');
        const serviceInput = document.createElement('input');
        const imagePreview = document.createElement('img');
        const customFileInput = document.createElement('label');
        const imageInput = document.createElement('input');
        const removeBtn = document.createElement('button');

        serviceDiv.classList.add('featureServiceContainer');
        serviceInput.type = 'text';
        serviceInput.placeholder = 'الخدمه';
        imagePreview.classList.add('serviceImagePreview', 'hidden');
        customFileInput.classList.add('customFileInput');
        customFileInput.textContent = 'رفع صورة للخدمة';
        imageInput.type = 'file';
        imageInput.classList.add('hidden');
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.classList.add('removeBtn');

        serviceDiv.appendChild(serviceInput);
        serviceDiv.appendChild(imagePreview);
        serviceDiv.appendChild(customFileInput);
        serviceDiv.appendChild(imageInput);
        serviceDiv.appendChild(removeBtn);
        servicesContainer.appendChild(serviceDiv);

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
            servicesContainer.removeChild(serviceDiv);
            servicesArray = servicesArray.filter(item => item !== serviceDiv);
        });
    });

    imageInput.addEventListener('change', function(event) {
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
                imagePreviewContainer.appendChild(imageDiv);

                imagesArray.push(file);

                removeBtn.addEventListener('click', function() {
                    imagePreviewContainer.removeChild(imageDiv);
                    imagesArray = imagesArray.filter(item => item !== file);
                });
            };
            reader.readAsDataURL(file);
        }
        imageInput.value = '';
    });

    addUnitBtn.addEventListener('click', function() {
        const unitDiv = document.createElement('div');
        const nameInput = document.createElement('input');
        const sizeInput = document.createElement('input');
        const roomsInput = document.createElement('input');
        const priceInput = document.createElement('input');
        const removeBtn = document.createElement('button');

        unitDiv.classList.add('unitContainer');
        nameInput.type = 'text';
        nameInput.placeholder = 'اسم الوحدة';
        sizeInput.type = 'text';
        sizeInput.placeholder = 'الحجم';
        roomsInput.type = 'number';
        roomsInput.placeholder = 'عدد الغرف';
        priceInput.type = 'number';
        priceInput.placeholder = 'السعر';
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.classList.add('removeBtn');

        unitDiv.appendChild(nameInput);
        unitDiv.appendChild(sizeInput);
        unitDiv.appendChild(roomsInput);
        unitDiv.appendChild(priceInput);
        unitDiv.appendChild(removeBtn);
        unitsContainer.appendChild(unitDiv);

        unitsArray.push(unitDiv);

        removeBtn.addEventListener('click', function() {
            unitsContainer.removeChild(unitDiv);
            unitsArray = unitsArray.filter(item => item !== unitDiv);
        });
    });

    document.getElementById('uploadForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessage.style.display = 'none';

        const projectName = document.getElementsByName('projectName')[0].value;
        const aboutProject = document.getElementsByName('aboutProject')[0].value;
        const videoInput = document.getElementById('videoInput').value;
        const features = featuresArray.map(div => div.querySelector('input').value);
        const services = servicesArray.map(div => ({
            service: div.querySelector('input[type="text"]').value,
            image: div.querySelector('input[type="file"]').files[0]
        }));
        const units = unitsArray.map(div => ({
            name: div.querySelector('input[placeholder="اسم الوحدة"]').value,
            size: div.querySelector('input[placeholder="الحجم"]').value,
            numberOfRooms: div.querySelector('input[placeholder="عدد الغرف"]').value,
            price: div.querySelector('input[placeholder="السعر"]').value
        }));

        const formData = new FormData();
        imagesArray.forEach(file => {
            formData.append('files', file);
        });
        services.forEach(service => {
            if (service.image) {
                formData.append('serviceImages', service.image);
            }
        });

        formData.append('video', videoInput);
        formData.append('projectName', projectName);
        formData.append('aboutProject', aboutProject);
        formData.append('projectFeatures', JSON.stringify(features));
        formData.append('locationServices', JSON.stringify(services.map(s => ({ service: s.service, image: s.image ? `/uploads/${s.image.name}` : '' }))));
        formData.append('units', JSON.stringify(units));

        loader.style.display = 'flex';

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            loader.style.display = 'none';
            if (response.ok) {
                const result = await response.json();
                alertMessage.textContent = result.message || 'تم الاضافه بنجاح';
                alertBox.style.backgroundColor = '#445372';
                alertBox.style.display = 'block';
            } else {
                const errorText = await response.text();
                console.error('فشل في التحميل:', JSON.parse(errorText).message);
                alertMessage.textContent = 'فشل في التحميل: ' + JSON.parse(errorText).message;
                alertBox.style.backgroundColor = '#d9534f';
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء التحميل:', error);
            alertMessage.textContent = 'حدث خطأ أثناء التحميل: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f';
            alertBox.style.display = 'block';
        }
    });

    closeBtn.addEventListener('click', function() {
        alertBox.style.display = 'none';
    });
});
