function edit(name) {
    location.href = location.href.split('?')[0] + (name ? '?edit=' + name : "");
}

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

function deleteSet(set_id) {
    if (!confirm("Are you sure you want to delete this set?")) {
        return;
    }
    fetch("/api/sets/" + set_id, {
        method: "DELETE"
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            location.href = "account";
        }
    })
}

function addCategory(categoryId, setId, roundNumber) {
    fetch(`/api/sets/${setId}/categories`, {
        body: JSON.stringify({
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

function addRound () {
    fetch(`/api/sets/${set_id}/rounds`, {
        method: "POST"
    }).catch(err => {
        console.error(err);
    }).then(res => {
        if (res.status == 201) {
            location.reload();
        } else {
            console.error("Something went wrong");
        }
    })
}

function saveRoundName(roundNumber) {
    console.log("roundName" + roundNumber)
    let newName = document.getElementById("roundName" + roundNumber).innerHTML;
    fetch(`/api/sets/${set_id}/rounds`, {
        body: JSON.stringify({
            round_number: roundNumber,
            round_name: newName
        }),
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        console.log(res.status)
        if (res.status == 200) {
            edit();
        } else {
            console.error("Something went wrong");
        }
    })
}

function deleteRound(roundNumber) {
    if (!confirm("Are you sure you want to delete this round?")) {
        return;
    }
    fetch(`/api/sets/${set_id}/rounds`, {
        body: JSON.stringify({
            round_number: roundNumber
        }),
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        console.log(res.status)
        if (res.status == 200) {
            edit();
        } else {
            console.error("Something went wrong");
        }
    })
}