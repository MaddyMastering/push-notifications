this.addEventListener('install', event => {
    console.log('service worker has been installed');
});

this.addEventListener('activate', event => {
    console.log('service worker has been activated');
});

this.addEventListener('push', event => {
    event.waitUntil(
        fetch('http://localhost:5000/get-payload-data')
            .then(response => response.json())
            .then(payload => {
                var options = {
                    body: payload.body,
                    icon: payload.image,
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: payload.id
                    }
                };
                this.registration.showNotification(payload.title, options)
            })
    );
});