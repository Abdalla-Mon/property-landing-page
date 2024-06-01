import { checkAuth } from "./checkauth.js"

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();

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

    let featuresArray = [];
    let servicesArray = [];
    let imagesArray = [];

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
        const removeBtn = document.createElement('button');

        serviceDiv.classList.add('featureServiceContainer');
        serviceInput.type = 'text';
        serviceInput.placeholder = 'الخدمه';
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.classList.add('removeBtn');

        serviceDiv.appendChild(serviceInput);
        serviceDiv.appendChild(removeBtn);
        servicesContainer.appendChild(serviceDiv);

        servicesArray.push(serviceDiv);

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

    document.getElementById('uploadForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData();
        const videoInput = document.getElementById('videoInput');

        imagesArray.forEach(file => {
            formData.append('files', file);
        });

        formData.append('video', videoInput.value);
        formData.append('projectName', document.getElementsByName('projectName')[0].value);
        formData.append('aboutProject', document.getElementsByName('aboutProject')[0].value);

        const features = featuresArray.map(div => div.querySelector('input').value);
        const services = servicesArray.map(div => div.querySelector('input').value);

        formData.append('projectFeatures', JSON.stringify(features));
        formData.append('locationServices', JSON.stringify(services));

        loader.style.display = 'flex';

        const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

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
                console.error('فشل في التحميل:', errorText);
                alertMessage.textContent = 'فشل في التحميل: ' + errorText;
                alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء التحميل:', error);
            alertMessage.textContent = 'حدث خطأ أثناء التحميل: ' + error.message;
            alertBox.style.backgroundColor = '#d9534f'; // Bootstrap danger color
            alertBox.style.display = 'block';
        }
    });

    closeBtn.addEventListener('click', function() {
        alertBox.style.display = 'none';
    });
});
