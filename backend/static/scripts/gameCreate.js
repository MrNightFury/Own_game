var choosenSet;
function chooseSet(setId, setName) {
    choosenSet = setId;
    document.getElementById("choosenSet").innerHTML = setName;
}

async function createGame() {
    let gameName = document.getElementById("titleInput").innerHTML;
    fetch("/game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: gameName,
            setId: choosenSet
        })
    }).then(async response => {
        let id = (await response.json()).id;
        if (response.status === 201) {
            window.location.href = "/game/" + id;
        } else {
            response.text().then(text => {
                alert(text);
            });
        }
    });
}