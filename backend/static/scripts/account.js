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