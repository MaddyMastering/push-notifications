let publicKey = null;
let registration = null;
let subscription = null;

function updateButtonState(state) {
    const subscribe = document.getElementById('btn-subscribe');
    const unsubscribe = document.getElementById('btn-unsubscribe');

    // show subscribe button
    if (state === 'default' || state === 'denied') {
        subscribe.style.display = 'block';
        unsubscribe.style.display = 'none';
    }

    // show unsubscribe button
    if (state === 'granted') {
        subscribe.style.display = 'none';
        unsubscribe.style.display = 'block';
        notifyPushServer();
    }
}

// from web-push lib
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function subscribe() {
    // request permission
    window.Notification.requestPermission().then(response => {
        updateButtonState(response);
    });
}

function unsubscribe() {
    subscription.unsubscribe().then(() => {
        // not sure how to reset permission
        fetch('http://localhost:5000/unsubscribe').then(() => {
            updateButtonState('default');
        });
    });
}

function notifyPushServer() {
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    }).then(sub => {
        subscription = sub;
        fetch('http://localhost:5000/subscribe', {
            method: 'POST',
            body: JSON.stringify(sub),
            headers: { 'content-type': 'application/json' }
        });
    });
}

// IIFE
(() => {
    // register service worker
    navigator.serviceWorker.register('sw.js')
        .then((reg) => {
            registration = reg;

            // get public key from server
            fetch('http://localhost:5000/public-key')
                .then(response => response.json())
                .then(data => {
                    publicKey = data.publicKey;

                    // update button state
                    updateButtonState(window.Notification.permission);
                });
        })
        .catch((err) => console.log(`SW Register: Error ${err}`));
})();
