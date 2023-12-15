function edit(name) {
    location.href = location.href.split('?')[0] + (name ? '?edit=' + name : "");
}

function saveCategory() {
    let body = {
        category_name: categoryTitle.innerHTML
    }
    fetch("/api/categories/" + category_id, {
        body: JSON.stringify(body),
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            edit();
        }
    })
}

function deleteCategory() {
    if (!confirm("Are you sure you want to delete this set?")) {
        return;
    }
    fetch("/api/categories/" + category_id, {
        method: "DELETE"
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            location.href = "account";
        }
    })
}

function addDefaultQuestion(numb) {
    let body = {
        question_text: "Question",
        question_answer: "Answer"
    }
    fetch("/api/categories/" + category_id + "/questions", {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 201) {
            location.reload();
            // location.href = location.href + "#q" + 0;
        }
    })
}

function saveQuestion(questionNumber) {
    let body = {
        question_number: questionNumber,
        question_title: document.getElementById("title" + questionNumber).innerHTML,
        question_text: document.getElementById("text" + questionNumber).innerHTML,
        question_answer: document.getElementById("ans" + questionNumber).innerHTML
    }
    fetch("/api/categories/" + category_id + "/questions", {
        body: JSON.stringify(body),
        method: "PUT",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            edit();
        }
    })
}

function deleteQuestion (number){
    if (!confirm("Are you sure you want to delete this question?")) {
        return;
    }
    fetch("/api/categories/" + category_id + "/questions", {
        body: JSON.stringify({
            question_number: number
        }),
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            edit();
        }
    })
}

function swapQuestions (number) {
    let body = {
        number: number
    }
    fetch("/api/categories/" + category_id + "/questions", {
        body: JSON.stringify(body),
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).catch(err => {
        console.error(err);
    }).then(async res => {
        if (res.status == 200) {
            location.reload();
        }
    })
}