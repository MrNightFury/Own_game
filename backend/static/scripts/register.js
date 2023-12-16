document.getElementById("registerForm").addEventListener("submit", event => {
    event.preventDefault();
    let loginLabel = document.querySelector("#loginInput label")
    loginLabel.style.display = "none";
    document.querySelector("#passwordInput label").style.display = "none";
    document.querySelector("#confirmPasswordInput label").style.display = "none";
    let formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    if (data.password != data.confirmPassword) {
        document.querySelector("#confirmPasswordInput label").style.display = "inline";
    }
    fetch("/auth/register", {body: JSON.stringify(data), method: "POST", headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }}).then(async result => {
        if (result.status == 403) {
            loginLabel.style.display = "inline";
            loginLabel.innerHTML = "Недопустимый логин";
        } else if (result.status == 409) {
            loginLabel.style.display = "inline";
            loginLabel.innerHTML = "Пользователь с таким логином уже существует";
        } else if (result.status == 400) {
            // location.href = "/account/" + data.login;
        } else if (result.status == 201) {
            location.href = "/account/" + data.login;
        }
    })
})