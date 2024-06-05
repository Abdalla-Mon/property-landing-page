import { checkAdminAuth } from "./checkAdminAuth.js"

document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth(true)
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = '../admin-page/index.html';
            } else {
                const errorData = await response.json();
                let errorMsg = '';

                if (response.status === 401) {
                    errorMsg = 'كلمة المرور غير صحيحة. حاول مرة أخرى.';
                } else if (response.status === 404) {
                    errorMsg = 'المستخدم غير موجود. تحقق من البريد الإلكتروني.';
                } else if (response.status === 500) {
                    errorMsg = 'خطأ في الخادم. حاول مرة أخرى لاحقًا.';
                } else {
                    errorMsg = errorData.message || 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد الخاصة بك.';
                }
                errorMessage.textContent = errorMsg;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.textContent = 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى لاحقًا.';
            errorMessage.style.display = 'block';
        }
    });
});
