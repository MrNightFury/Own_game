function checkFilterDown() {
    if (+filterDown.value > +filterUp.value && filterUp.value != '') {
        filterUp.value = filterDown.value
    }
}

function checkFilterUp() {
    if (+filterDown.value > +filterUp.value && filterDown.value != '') {
        filterDown.value = filterUp.value
    }
}