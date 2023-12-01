function edit(name) {
    location.href = location.href.split('?')[0] + (name ? '?edit=' + name : "");
}

function createCategory() {
    let body = {
        category_name: "Default name"
    }
    fetch("/api/categories", {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        console.log(res)
        if (res.status == 201) {
            let id = (await res.json()).id
            location.href = "categories/" + id;
        }
    })
}

async function saveInfo() {
    let body = {
        user_login: userLoginInput.innerHTML
    }

    let info = await fetch("/api/users/" + userId, {
        body: JSON.stringify(body),
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        return res.status == 200;
    })
    if (!info) {
        return;
    }

    if (avatarInput.files.length) {
        console.log("Uploading")
        let data = new FormData();
        data.append("file", avatarInput.files[0]);
        info = await fetch("/api/users/" + userId + "/icon", {
            body: data,
            method: "POST",
            contentType: 'multipart/form-data',
        }).catch(err => {
            console.error(err);
        }).then(async res => {
            return res.status == 201
        })
    }
    if (info) {
        edit();
    }
}