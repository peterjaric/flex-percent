let getProject =
    i => document.querySelectorAll('.body .row')[i].querySelectorAll('.Kontering input')[0].getAttribute('data-entitydescription');
let getSumma =
    i => document.querySelectorAll('.summa .body .row')[i].querySelector('.cell').textContent.trim();
let getProjectCount = () => document.querySelectorAll('.body .row').length;

let getProjects =
    () => {
        let projects = {};
        for (let i = 0; i < getProjectCount(); i++) {
            try {
                let project = getProject(i);
                if (project) {
                    projects[project] = getSumma(i);
                }
            } catch (e) { }
        }
        return projects;
    };

let showModal = (html) => {
    var modal = document.querySelector('#project-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'project-modal';
        modal.setAttribute('style', 'background:rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; width: 100%; height: 100%; color: rgb(255, 255, 255); z-index: 100;');
        document.body.appendChild(modal);

        let close = document.createElement('a');
        close.text = "Close";
        close.href = "#";
        close.onclick = () => { modal.remove(); return false; };
        modal.appendChild(close);
    }

    var modalBody = modal.querySelector('#modal-body');
    if (!modalBody) {
        modalBody = document.createElement('div');
        modalBody.id = 'modal-body';
        modal.appendChild(modalBody);
    }

    modalBody.innerHTML = html;
};

let countTotal = () => {
    let inputs = document.querySelectorAll('#project-modal .input-row.is-data');

    let values = Array.from(inputs).map(input => input.querySelector('input').checked ? Number.parseFloat(input.dataset.value.replace(/,/, ".")) : 0);

    return values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

let updateTotal = () => {
    let total = countTotal();
    document.querySelector('#project-modal .input-row:not(.is-data) .value').innerText = countTotal();
};

let updateRows = () => {
    let inputs = document.querySelectorAll('#project-modal .input-row.is-data');
    let total = countTotal();
    Array.from(inputs).forEach(input => {
        let percentSpan = input.querySelector('.percent');
        if (input.querySelector('input').checked) {
            let hours = Number.parseFloat(input.dataset.value.replace(/,/, "."));
            percentSpan.innerText = Math.round(100 * hours / total) + " %";
        } else {
            percentSpan.innerText = '';
        }
    });
}

let updateAll = () => {
    updateTotal();
    updateRows();
}
let createRow = (key, value, isData) => "<div class='input-row" + (isData ? " is-data" : "") + "' data-value='" + value + "'>" + (isData ? ("<input checked onChange='updateAll()' type=checkbox value='" + key + "'/>") : "") + "<span style='display: inline-block; width: 400px;'>" + key + ": </span><span style='display: inline-block; min-width: 200px;' class='value'>" + value + "</span> <span class='percent'></span></div>";
let rowsHtml = Object.entries(getProjects()).map(([key, value]) => createRow(key, value, true)).join("");
let sumHtml = createRow("Totalt", 0, false);

showModal(rowsHtml + sumHtml);
updateAll();
