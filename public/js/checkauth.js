export async function checkAuth(dontRedirect = false) {
    const token = localStorage.getItem('authToken');

    if (!token&&!dontRedirect) {
        window.location.href = 'login.html';
        return;
    }

    // Show a custom popup
    const popup = document.createElement('div');
    popup.id = 'auth-check-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.color = 'white';
    popup.style.fontSize = '2rem';
    popup.innerText = 'نحن نتحقق من حالة مصادقتك...';
    document.body.appendChild(popup);

    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            document.querySelector('.page-content').style.display = 'block';
            if(dontRedirect) {
                window.location.href = '/dashboard/index.html';
            }
        } else {
            if(!dontRedirect){
            window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        if(!dontRedirect) {
            window.location.href = 'login.html';
        }
    }finally
    {
        popup.remove();
    }
}
