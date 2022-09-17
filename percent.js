let getProject =
    i => document.querySelectorAll('.body .row')[i].querySelectorAll('.Kontering input')[0].getAttribute('data-entitydescription');
let getSumma =
    i => Number.parseFloat(document.querySelectorAll('.summa .body .row')[i].querySelector('.cell').textContent.trim().replace(',', '.'));
let getProjectCount = () => document.querySelectorAll('.body .row').length;

let getCurrentMonthProjects = () => {
    let projects = {};
    for (let i = 0; i < getProjectCount(); i++) {
        try {
            let project = getProject(i);
            if (project) {
                if (!projects[project]) {
                    projects[project] = 0;
                }
                projects[project] += getSumma(i);
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
        modal.setAttribute('style', 'font-size: 15px; line-height: 1.5; padding: 20px; background:rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; width: 100%; height: 100%; color: rgb(255, 255, 255); z-index: 100;');
        document.body.appendChild(modal);

        let instructions = document.createElement('p');
        instructions.setAttribute('style', 'max-width: 900px');
        instructions.innerText = 'Denna tabell visar hur timmarna fördelas för ' + (Object.keys(projects).length === 1 ? 'den aktuella månaden' : 'de aktuella månaderna') + 
            '. Ange hur många procent du jobbar och klicka ur de projekt ' + (Object.keys(projects).length === 1 ? '' : 'och månader') + ' som inte är aktuella för sammanräkningen så kommer procentsatserna att uppdateras.' + 
            ' Du kan lägga till fler månader genom att stänga detta fönster, byta månad i månadsvyn och sedan aktivera skriptet igen.';
        modal.appendChild(instructions);

        modal.appendChild(modalBody);

        if (Object.keys(projects).length > 1) {
            let clear = document.createElement('a');
            clear.setAttribute('style', 'padding: 5px 10px; border: 1px solid white; margin-top: 15px; margin-right: 15px; display: inline-block;');
            clear.text = 'Nollställ och stäng';
            clear.href = '#';
            clear.onclick = () => { localStorage.removeItem('projects'); projects = {}; modal.remove(); return false; };
            modal.appendChild(clear);
        }

        let close = document.createElement('a');
        close.setAttribute('style', 'padding: 5px 10px; border: 1px solid white; margin-top: 15px; display: inline-block;');
        close.text = 'Stäng';
        close.href = '#';
        close.onclick = () => { modal.remove(); return false; };
        modal.appendChild(close);
    }

    modalBody.innerHTML = html;
};

let updateAll = () => {
    let wp = Number.parseInt(document.querySelector('#project-modal .workingPercent').value) / 100;

    // Total hours each month
    document.querySelectorAll('#project-modal tr.total td[class^="hour2"]').forEach((td) => {
        month = td.className.split('hour')[1];
        if (Object.keys(projects).length == 1 || document.querySelector('#project-modal tr.header th.header' + month + ' input').checked) {
            let totalHours = 0;
            for (const [project, hour] of Object.entries(projects[month])) {
                totalHours += document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' input').checked ? hour : 0;
            }
            td.innerText = totalHours.toFixed(2).replace('.', ',');
        }
        else {
            td.innerText = '';
        }
    });

    // Percent each project each month
    projectNames.forEach((project) => {
        if (document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' input').checked) {
            Object.keys(projects).forEach((month) => {
                if (Object.keys(projects).length == 1 || document.querySelector('#project-modal tr.header th.header' + month + ' input').checked) {
                    document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.percent' + month).innerText = 
                        (projects[month][project] ? 
                        Math.round(projects[month][project] / Number.parseFloat(document.querySelector('#project-modal tr.total td.hour' + month).innerText.replace(',', '.')) * wp * 100) + ' %' : 
                        '');
                }
                else {
                    document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.percent' + month).innerText = '';
                }
            });
        }
        else {
            document.querySelectorAll('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td[class^="percent"]').forEach((td) => {td.innerText = '';});
        }
    });

    // Total percent each month
    document.querySelectorAll('#project-modal tr.total td[class^="percent2"]').forEach((td) => {
        month = td.className.split('percent')[1];
        td.innerText = 
            Object.keys(projects).length == 1 || document.querySelector('#project-modal tr.header th.header' + month + ' input').checked ? 
            (document.querySelector('#project-modal tr.total td.hour' + month).innerText !== '0,00' ? (wp * 100) + ' %' : '') :
            '';
    });

    if (Object.keys(projects).length > 1) {
        // Total hours each project
        projectNames.forEach((project) => {
            if (document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' input').checked) {
                let totalHours = 0;
                Object.keys(projects).forEach((month) => {
                    if (document.querySelector('#project-modal tr.header th.header' + month + ' input').checked) {
                        totalHours += projects[month][project] ? projects[month][project] : 0;
                    }
                });
                document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.hourTotal').innerText = totalHours.toFixed(2).replace('.', ',');
            }
            else {
                document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.hourTotal').innerText = '';
            }
        });

        // Total hours
        let totalHours = 0;
        Object.keys(projects).forEach((month) => {
            if (document.querySelector('#project-modal tr.header th.header' + month + ' input').checked) {
                totalHours += Number.parseFloat(document.querySelector('#project-modal tr.total td.hour' + month).innerText.replace(',', '.'));
            }
        });
        document.querySelector('#project-modal tr.total td.hourTotal').innerText = totalHours.toFixed(2).replace('.', ',');

    
        // Total percent each project
        projectNames.forEach((project) => {
            document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.percentTotal').innerText = 
                document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' input').checked && 
                document.querySelector('#project-modal tr.total td.hourTotal').innerText != '0,00' ? 
                Math.round(
                    Number.parseFloat(document.querySelector('#project-modal tr.project' + project.replaceAll(/\W/g, '') + ' td.hourTotal').innerText.replace(',', '.')) / 
                    Number.parseFloat(document.querySelector('#project-modal tr.total td.hourTotal').innerText.replace(',', '.')) * wp * 100) + ' %' :
                '';
        });

        // Total percent
        document.querySelector('#project-modal tr.total td.percentTotal').innerText = 
            document.querySelector('#project-modal tr.total td.hourTotal').innerText !== '0,00' ? (wp * 100) + ' %' : '';
    }

};

let getProjectNames = () => {
    let names = [];
    Object.keys(projects).forEach((month) => {names = names.concat(Object.keys(projects[month]));});
    names = names.filter((item, pos) => names.indexOf(item) === pos).sort();

    return names;
};

let updateProjectsWithCurrentMonth = () => {
    projects[currentMonth] = getCurrentMonthProjects();
    localStorage.setItem('projects', JSON.stringify(projects));
    projectNames = getProjectNames();
}

let storageProjects = localStorage.getItem('projects');
let projects = storageProjects ? JSON.parse(storageProjects) : {};
let currentMonth = document.querySelector('#Period_EntityDescription').value;
let projectNames = getProjectNames();

let createWorkingPercentHtml = () =>
    "<div>Arbetstid: <input class='workingPercent' name='workingPercent' style='width: 40px; background-color: transparent; border: 1px solid white; color: white; text-align: right; font-size: 15px; padding-right: 5px; margin-bottom: 15px;' onChange='updateAll()' /> %</div>";

let createTableHtml = () => {
    const cellStyle0 = ' style="padding: 3px 30px 3px 0"';
    const cellStyle1 = ' style="padding: 3px 10px 3px 0; text-align: right; width: 50px;"';
    const cellStyle2 = ' style="padding: 3px 30px 3px 0; text-align: right; width: 40px;"';
    const cellStyle3 = ' style="padding: 3px 30px 3px 0; text-align: left; width: 40px;"';
    const cellStyle4 = ' style="padding: 3px 0px 3px 0; text-align: right; width: 40px;"';
    const cellStyle5 = ' style="padding: 3px 0px 3px 0; text-align: left; width: 40px;"';
    
    tableHtml = '<table>';
    if (Object.keys(projects).length > 1) {
        tableHtml += '<tr class="header" style="border-bottom: 1px solid white">';
        tableHtml += '<th></th>';
        Object.keys(projects).forEach((month) => {
            tableHtml += '<th colspan="2"' + cellStyle3 + ' class="header' + month + '"><input checked onChange="updateAll()" type=checkbox value="' + month + '"/> ' + month + '</th>';
        });
        tableHtml += '<th colspan="2"' + cellStyle5 + '>Totalt</th>';
        tableHtml += '</tr>';
    }
    projectNames.forEach((project) => {
        tableHtml += '<tr class="project' + project.replaceAll(/\W/g, '') + '">';
        tableHtml += '<td ' + cellStyle0 + '><input checked onChange="updateAll()" type=checkbox value="' + project + '"/> ' + project + '</td>';

        Object.keys(projects).forEach((month) => {
            tableHtml += '<td class="hour' + month + '"' + cellStyle1 + '>' + (projects[month][project] ? projects[month][project].toFixed(2).replace('.', ',') : '') + '</td>';
            tableHtml += '<td class="percent' + month + '"' + (Object.keys(projects).length === 1 ? cellStyle4 : cellStyle2) + '></td>';
        });

        tableHtml += Object.keys(projects).length > 1 ? '<td class="hourTotal"' + cellStyle1 + '></td>' : '';
        tableHtml += Object.keys(projects).length > 1 ? '<td class="percentTotal"' + cellStyle4 + '></td>' : '';
        tableHtml += '</tr>';
    });

    tableHtml += '<tr class="total" style="border-top: 1px solid white">';
    tableHtml += '<td>Totalt</td>';
    Object.keys(projects).forEach((month) => {
        tableHtml += '<td class="hour' + month + '"' + cellStyle1 + '></td>';
        tableHtml += '<td class="percent' + month + '"' + (Object.keys(projects).length === 1 ? cellStyle4 : cellStyle2)  + '></td>';
    });
    tableHtml += Object.keys(projects).length > 1 ? '<td class="hourTotal"' + cellStyle1 + '></td>' : '';
    tableHtml += Object.keys(projects).length > 1 ? '<td class="percentTotal"' + cellStyle4 + '></td>' : '';

    tableHtml += '</tr>';
    
    tableHtml += '</table>';

    return tableHtml;
}

let execute = (wp = 100) => {
    updateProjectsWithCurrentMonth();

    showModal(createWorkingPercentHtml() + createTableHtml());
    document.querySelector('#project-modal .workingPercent').value = wp;
    updateAll();
}