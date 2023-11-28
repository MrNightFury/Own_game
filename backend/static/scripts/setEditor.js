function saveSet() {
    let body = {
        set_name: setTitle.innerHTML,
        set_description: setDescription.innerHTML
    }
    if (set_id != -1) {
        body.set_id = set_id
    }
    console.log(body)
    fetch("/api/sets", {
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
            location.href = "sets/" + id;
        }
    })
}

function addCategory(categoryId, setId, roundNumber) {
    fetch("/api/sets/categories", {
        body: JSON.stringify({
            setId: setId,
            categoryId: categoryId,
            roundNumber: roundNumber
        }),
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            let id = (await res.json()).id;
            location.href = "sets/" + setId;
        } else {
            console.error("Something went wrong");
        }
    })
}

function removeCategory(setId, roundNumber, categoryId) {
    fetch(`/api/sets/${setId}/categories`, {
        body: JSON.stringify({
            categoryId: categoryId,
            roundNumber: roundNumber
        }),
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            location.reload();
        } else {
            console.error("Something went wrong");
        }
    })
}