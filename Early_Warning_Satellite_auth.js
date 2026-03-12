async function authenticate() {
    const code = document.getElementById('access-code').value;
    const msg = document.getElementById('error-msg');

    // Simulate API call
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            body: JSON.stringify({ code: code })
        });

        if (response.ok) {
            document.getElementById('mfa-stage-1').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');

            // Artificial delay for dramatic effect
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            msg.innerText = "ACCESS DENIED: INVALID CREDENTIALS";
        }
    } catch (e) {
        msg.innerText = "NETWORK ERROR: UPLINK DOWN";
    }
}