document.getElementById("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    document.querySelector("#loginInput label").style.display = "none";
    document.querySelector("#passwordInput label").style.display = "none";
    let formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    fetch("/auth/login", {body: JSON.stringify(data), method: "POST", headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }}).then(async result => {
        if (result.status == 404) {
            document.querySelector("#loginInput label").style.display = "inline";
        } else if (result.status == 401) {
            document.querySelector("#passwordInput label").style.display = "inline";
        } else if (result.status == 403) {
            document.querySelector("#bannedLabel").style.display = "inline";
        } else {
            let urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('redirect')) {
                location.href = urlParams.get('redirect');
            } else {
                location.href = "/account/" + data.login;
            }
        }
    })
})