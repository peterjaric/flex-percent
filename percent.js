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
    var modalBody = document.querySelector('#modal-body');
    if (!modalBody) {
        modalBody = document.createElement('div');
        modalBody.id = 'modal-body';
    }
    var modal = document.querySelector('#project-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'project-modal';
        modal.setAttribute('style', 'font-size: 15px; padding: 20px; background:rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; width: 100%; height: 100%; color: rgb(255, 255, 255); z-index: 100;');
        document.body.appendChild(modal);
        
        var name = document.querySelector('#ModelDescription').getValue();
        if (!name) {
            let title = document.createElement('h1');
            title.innerText = "Rapport för: " + name;
            modal.appendChild(title);
        }
        
        let instructions = document.createElement('p');
        instructions.innerText = "Denna tabell visar hur timmarna fördelas för den aktuella månaden. Klicka ur de projekt som inte är aktuella för sammanräkningen så kommer procentsatserna att uppdateras.";
        modal.appendChild(instructions);

        modal.appendChild(modalBody);

        let close = document.createElement('a');
        close.setAttribute('style', 'padding: 5px 10px; border: 1px solid white; margin-top: 5px; display: inline-block;');
        close.text = "Stäng";
        close.href = "#";
        close.onclick = () => { modal.remove(); return false; };
        modal.appendChild(close);
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

let createRow = (key, value, isData) => "<div style='margin: 5px;' class='input-row" + (isData ? " is-data" : "") + "' data-value='" + value + "'>" + (isData ? ("<input checked onChange='updateAll()' type=checkbox value='" + key + "'/>") : "") + "<span style='display: inline-block; width: 400px;'>" + key + ": </span><span style='display: inline-block; min-width: 200px;' class='value'>" + value + "</span> <span class='percent'>100 %</span></div>";
let rowsHtml = Object.entries(getProjects()).map(([key, value]) => createRow(key, value, true)).join("");
let sumHtml = createRow("Totalt", 0, false);
let execute = () => {
    showModal(rowsHtml + sumHtml);
    updateAll();
}
