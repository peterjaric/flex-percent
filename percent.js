/* eslint-disable no-param-reassign */

const SETTINGS = 'projectModalSettings';
const CHECKED = 'projectModalChecked';
const PROJECTS = 'projectModalProjects';
const WARNINGS = 'projectModalWarnings';

let warnings = JSON.parse(localStorage.getItem(WARNINGS))?.sort() || [];

const getProjectMonthView = (i) => document.querySelectorAll('.body div.row')[i]
  .querySelectorAll('.Kontering input')[0].getAttribute('data-entitydescription');
const getProjectDayView = (i) => document.querySelectorAll('.body div.row')[i]
  .querySelectorAll('.cell.Kontering.utokatProjekt input')[1]
  .getAttribute('data-entitydescription');
const getInternalCommentDayView = (i) => document.querySelectorAll('.body div.row')[i]
  .querySelectorAll('.InternKommentar textarea')[0].value;
const getHoursMonthView = (i, d) => Number
  .parseFloat(document.querySelectorAll('.right .body .row')[i]
    .querySelector(`.day-${d}`).textContent.trim().replace(',', '.')) || 0;
const hasInternalComment = (i, d) => (
  document.querySelectorAll('.right .body .row')[i]
    .querySelector(`.day-${d}`).classList.contains('hasContent')
);
const getHoursDayView = (i) => Number
  .parseFloat(document.querySelectorAll('.body div.row')[i]
    .querySelectorAll('.cell.Tid span')[0].textContent.trim().replace(',', '.')) || 0;
const getProjectCountMonthView = () => document.querySelectorAll('.body div.row').length;
const getProjectCountDayView = () => document.querySelectorAll('.body div.row').length;
const getCurrentMonth = () => document.querySelector('#Period_EntityDescription').value;
const getCurrentDay = () => document.querySelector('#CurrentDatum')
  .getAttribute('data-previous-value');
const getCurrentView = () => document.querySelectorAll('.textToolbarBtn.dropDown')[0]?.textContent;

const getCurrentMonthProjects = () => {
  const results = {};
  const currentMonth = getCurrentMonth();
  const currentMonthDate = new Date(currentMonth.substring(0, 4), currentMonth.substr(4, 6) - 1, 1);
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0)
    .getDate();
  const yearKey = currentMonthDate.getFullYear();
  const monthKey = currentMonthDate.getMonth() + 1 < 10
    ? `0${currentMonthDate.getMonth() + 1}`
    : currentMonthDate.getMonth() + 1;

  for (let p = 0; p < getProjectCountMonthView(); p += 1) {
    try {
      const project = getProjectMonthView(p);
      if (project) {
        for (let d = 1; d <= daysInMonth; d += 1) {
          const dateKey = `${yearKey}${monthKey}${d < 10 ? `0${d}` : d}`;
          if (hasInternalComment(p, d)) {
            if (warnings.indexOf(dateKey) === -1) {
              warnings.push(dateKey);
            }
          }

          results[project] = results[project] || {};
          results[project][dateKey] = results[project][dateKey] || 0;
          results[project][dateKey] += getHoursMonthView(p, d);
        }
      }
    // eslint-disable-next-line no-empty
    } catch (e) { }
  }

  // eslint-disable-next-line no-use-before-define
  updateStorageWarnings();

  return results;
};

const getCurrentDayProjects = () => {
  const results = {};
  const currentDay = getCurrentDay();
  const currentDayDate = new Date(
    currentDay.substring(0, 4),
    currentDay.substring(5, 7) - 1,
    currentDay.substring(8, 10),
  );
  const yearKey = currentDayDate.getFullYear();
  const monthKey = currentDayDate.getMonth() + 1 < 10
    ? `0${currentDayDate.getMonth() + 1}`
    : currentDayDate.getMonth() + 1;
  const dayKey = currentDayDate.getDate() < 10
    ? `0${currentDayDate.getDate()}`
    : currentDayDate.getDate();

  const dateKey = `${yearKey}${monthKey}${dayKey}`;
  const index = warnings.indexOf(dateKey);
  if (index > -1) {
    warnings.splice(index, 1);
  }

  for (let p = 0; p < getProjectCountDayView(); p += 1) {
    try {
      const name = getProjectDayView(p);

      if (name) {
        const internalComment = getInternalCommentDayView(p);
        // eslint-disable-next-line no-use-before-define
        const project = getUseInternalCommentsSetting() && internalComment
          ? `${name} - ${internalComment}`
          : name;
        results[project] = results[project] || {};
        results[project][dateKey] = results[project][dateKey] || 0;
        results[project][dateKey] += getHoursDayView(p);
      }
    // eslint-disable-next-line no-empty
    } catch (e) { }
  }

  // eslint-disable-next-line no-use-before-define
  updateStorageWarnings();

  return results;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getMonday = (year, week) => {
  const d = new Date(year, 0, 1 + week * 7);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const merge = (obj1, obj2) => {
  const result = { ...obj1 };
  Object.keys(obj2).forEach((key) => {
    result[key] = result[key] ? { ...result[key], ...obj2[key] } : obj2[key];
  });
  return result;
};

const sortObj = (obj) => Object.keys(obj).sort().reduce((result, key) => {
  result[key] = obj[key];
  return result;
}, {});

const updateStorageProjects = () => {
  const storageProjects = JSON.parse(localStorage.getItem(PROJECTS)) || {};
  if (getCurrentView() === 'Månadsvy') {
    Object.keys(storageProjects).forEach((project) => {
      Object.keys(storageProjects[project]).forEach((date) => {
        if (date.startsWith(getCurrentMonth())) {
          delete storageProjects[project][date];
        }
      });
    });
  }
  Object.keys(storageProjects).forEach((project) => {
    if (Object.keys(storageProjects[project]).length === 0) {
      delete storageProjects[project];
    }
  });

  let projects;
  if (getCurrentView() !== 'Månadsvy' && getCurrentView() !== 'Dagvy') {
    projects = storageProjects;
  } else {
    projects = sortObj(merge(
      storageProjects,
      getCurrentView() === 'Månadsvy' ? getCurrentMonthProjects() : getCurrentDayProjects(),
    ));
  }
  localStorage.setItem(PROJECTS, JSON.stringify(projects));
};

const clearStorageProjects = () => {
  localStorage.removeItem(PROJECTS);
};

const getStorageProjects = () => {
  const storageProjects = JSON.parse(localStorage.getItem(PROJECTS)) || {};
  return sortObj(storageProjects);
};

const updateStorageChecked = () => {
  const storageChecked = JSON.parse(localStorage.getItem(CHECKED)) || {};
  const checked = { ...storageChecked };

  document.querySelectorAll('#project-modal table input').forEach((input) => {
    checked[input.value] = input.checked;
  });

  localStorage.setItem(CHECKED, JSON.stringify(checked));
};
const getStorageChecked = () => JSON.parse(localStorage.getItem(CHECKED)) || {};

const clearStorageChecked = () => {
  localStorage.removeItem(CHECKED);
};

const updateStorageSettings = () => {
  const storageSettings = JSON.parse(localStorage.getItem(SETTINGS)) || {};
  let settings = { ...storageSettings };

  const wpNode = document.querySelector('#project-modal input.workingPercent');
  if (wpNode) {
    settings.wp = Number.parseInt(wpNode.value, 10);
  }

  const timeNode = document.querySelector('#project-modal input[name="time"]');
  if (timeNode) {
    settings.time = timeNode.value === 'week' && timeNode.checked ? 'week' : 'month';
  }

  const showHoursNode = document.querySelector('#project-modal input[name="showHours"]');
  if (showHoursNode) {
    settings.showHours = showHoursNode.checked;
  }

  const useInternalCommentsNode = document
    .querySelector('#project-modal input[name="useInternalComments"]');
  if (useInternalCommentsNode) {
    settings.useInternalComments = useInternalCommentsNode.checked;
  }

  if (Object.keys(settings).length === 0) {
    settings = {
      wp: 100, time: 'month', showHours: true, useInternalComments: false,
    };
  }

  localStorage.setItem(SETTINGS, JSON.stringify(settings));
};
const getStorageSettings = () => JSON.parse(localStorage.getItem(SETTINGS)) || {};

const updateStorageWarnings = () => {
  localStorage.setItem(WARNINGS, JSON.stringify(warnings));
};

const clearStorageWarnings = () => {
  warnings = [];
  localStorage.removeItem(WARNINGS);
};

const updateStorage = () => {
  updateStorageProjects();
  updateStorageChecked();
  updateStorageSettings();
  updateStorageWarnings();
};

const getStorageProjectsByWeek = () => {
  const projects = getStorageProjects();
  const result = {};

  Object.keys(projects).forEach((project) => {
    Object.keys(projects[project]).forEach((date) => {
      const dateObj = (
        new Date(date.substring(0, 4), date.substring(4, 6) - 1, date.substring(6, 8))
      );
      const week = getWeekNumber(dateObj);
      const weekYear = dateObj.getMonth() === 0 && week > 50
        ? dateObj.getFullYear() - 1
        : dateObj.getFullYear();
      const weekKey = `v${weekYear}${week < 10 ? `0${week}` : week}`;

      result[weekKey] = result[weekKey] || {};
      result[weekKey][project] = result[weekKey][project] || 0;
      result[weekKey][project] += projects[project][date];
    });
  });

  return sortObj(result);
};

const getStorageProjectsByMonth = () => {
  const projects = getStorageProjects();
  const result = {};

  Object.keys(projects).forEach((project) => {
    Object.keys(projects[project]).forEach((date) => {
      const dateObj = (
        new Date(date.substring(0, 4), date.substring(4, 6) - 1, date.substring(6, 8))
      );
      const month = dateObj.getMonth() + 1;
      const monthYear = dateObj.getFullYear();
      const monthKey = `m${monthYear}${month < 10 ? `0${month}` : month}`;

      result[monthKey] = result[monthKey] || {};
      result[monthKey][project] = result[monthKey][project] || 0;
      result[monthKey][project] += projects[project][date];
    });
  });

  return sortObj(result);
};

const getProjectNames = () => Object.keys(getStorageProjects());

const getShowWeeksSetting = () => (
  document.querySelector('#project-modal input[name="time"]:checked')?.value === 'week' || false
);
const getShowHoursSetting = () => (
  document.querySelector('#project-modal input[name="showHours"]').checked
);
const getUseInternalCommentsSetting = () => {
  if (document.querySelector('#project-modal input[name="useInternalComments"]')) {
    return document.querySelector('#project-modal input[name="useInternalComments"]').checked;
  }

  return getStorageSettings().useInternalComments || false;
};

const isSingleTime = (projectsByTime) => Object.keys(projectsByTime).length === 1;
const showTotalColumn = (projectsByTime) => Object.keys(projectsByTime).length > 1;

const projectId = (project) => project.replaceAll(/\W/g, '');
const parseHour = (hour) => Number.parseFloat(hour.replace(',', '.')) || 0;
const printHours = (hours) => (hours ? hours.toFixed(2).replace('.', ',') : '');
const printPercent = (percent) => (percent ? `${Math.round(percent * 100)} %` : '');
const printTime = (time, short = false) => {
  if (time.match(/^v\d/) !== null) {
    const year = Number.parseInt(time.substring(1, 5), 10);
    const week = Number.parseInt(time.substring(5, 7), 10);
    const monday = getMonday(year, week);
    const isoMonday = `${monday.getFullYear()}-${monday.getMonth() + 1 < 10 ? `0${monday.getMonth() + 1}` : monday.getMonth() + 1}-${monday.getDate() < 10 ? `0${monday.getDate()}` : monday.getDate()}`;
    return `<a href="/HRM/Tid/Vecka?datum=${isoMonday}">V${week}</a>`;
  }

  if (time.match(/^m\d/) !== null) {
    let months;
    if (short) {
      months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
      ];
    } else {
      months = [
        'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
        'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
      ];
    }
    const year = Number.parseInt(time.substring(1, 5), 10);
    const month = Number.parseInt(time.substring(5, 7), 10);
    const isoDate = `${year}-${month < 10 ? `0${month}` : month}-01`;
    return `<a href="/HRM/Tid/Manad?datum=${isoDate}">${months[month - 1]}</a`;
  }

  return time;
};
const getTimeFromClassName = (className, prefix) => (
  className.replace(new RegExp(`.*${prefix}(v|m)(\\d\\d\\d\\d\\d\\d).*`), '$1$2')
);

const showModal = (html, css) => {
  if (!document.querySelector('#project-modal-style')) {
    const styleNode = document.createElement('style');
    styleNode.id = 'project-modal-style';
    styleNode.innerHTML = css;
    document.head.appendChild(styleNode);
  }

  let modalBody = document.querySelector('#modal-body');
  if (!modalBody) {
    modalBody = document.createElement('div');
    modalBody.id = 'modal-body';
  }
  let modal = document.querySelector('#project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'project-modal';
    document.body.appendChild(modal);

    const instructions = document.createElement('p');
    instructions.innerText = 'Denna tabell visar hur timmarna fördelas för de valda datumen. Ange hur många procent du jobbar, välj om du vill visa veckor eller månader samt om du vill visa timmar och klicka ur de projekt och veckor/månader som inte är aktuella för sammanräkningen så kommer procentsatserna att uppdateras. Du kan lägga till fler datum genom att stänga detta fönster, byta dag/månad i FlexHRM:s dag/månadsvy och sedan aktivera skriptet igen. Du kan även använda dig av interna kommentarer i FlexHRM för att dela in projekten ytterligare.';
    modal.appendChild(instructions);

    const storageSettings = getStorageSettings();
    const wpSetting = storageSettings.wp;
    const timeSetting = storageSettings.time;
    const showHoursSetting = storageSettings.showHours;
    const useInternalCommentsSetting = storageSettings.useInternalComments;

    const settings = document.createElement('div');

    settings.innerHTML = (
      'Arbetstid: '
      + `<input class="workingPercent" name="workingPercent" onChange="updateStorageSettings(); updateAll();" value="${wpSetting}"/> %`
      + `<input onChange="showWeeks()" type="radio" name="time" value="week" ${timeSetting === 'week' ? 'checked' : ''}/>Visa veckor`
      + `<input onChange="showMonths()" type="radio" name="time" value="month" ${timeSetting === 'month' ? 'checked' : ''}/>Visa månader`
      + `<input onChange="showHours()" type="checkbox" name="showHours" ${showHoursSetting ? 'checked' : ''}/>Visa timmar`
      + `<input onChange="useInternalComments()" type="checkbox" name="useInternalComments" ${useInternalCommentsSetting ? 'checked' : ''}/>Använd interna kommentarer för projektindelning`
    );
    modal.appendChild(settings);

    modal.appendChild(modalBody);

    const clear = document.createElement('a');
    clear.text = 'Nollställ och stäng';
    clear.href = '#';
    clear.onclick = () => {
      clearStorageProjects();
      clearStorageChecked();
      clearStorageWarnings();
      modal.remove();
      return false;
    };
    modal.appendChild(clear);

    const close = document.createElement('a');
    close.text = 'Stäng';
    close.href = '#';
    close.onclick = () => { modal.remove(); return false; };
    modal.appendChild(close);
  }

  modalBody.innerHTML = html;
};

const createTableHtml = (projectsByTime, showHours) => {
  if (Object.keys(projectsByTime).length === 0 && projectsByTime.constructor === Object) {
    return '<p><em>Välj dagvy eller månadsvy och aktivera sedan skriptet igen för att lägga till datum.</em></p>';
  }

  const checked = getStorageChecked();
  const showHoursStyle = showHours ? '' : ' style="display: none;"';

  let html = '<table>';

  const colspan = `colspan="${showHours ? 2 : 1}"`;
  html += '<tr class="header">';
  html += '<th></th>';
  Object.keys(projectsByTime).forEach((time) => {
    html += `<th ${colspan} class="header${time}">`;
    if (!isSingleTime(projectsByTime)) {
      const checkedAttribute = checked[time] === undefined || checked[time] ? 'checked' : '';
      const valueAttribute = `value="${time}"`;

      html += `<input onChange="updateStorageChecked(); updateAll();" type=checkbox ${valueAttribute} ${checkedAttribute}/>`;
    }
    html += printTime(time, !showHours);
    html += '</th>';
  });
  if (showTotalColumn(projectsByTime)) {
    html += `<th ${colspan} class="isTotal">Totalt</th>`;
  }
  html += '</tr>';

  const projectNames = getProjectNames();

  projectNames.forEach((project) => {
    const checkedAttribute = checked[project] === undefined || checked[project] ? 'checked' : '';
    const valueAttribute = `value="${project}"`;

    html += `<tr class="project project${projectId(project)}">`;
    html += `<td><input onChange="updateStorageChecked(); updateAll();" type=checkbox ${valueAttribute} ${checkedAttribute}/>`;
    html += `${project}</td>`;

    Object.keys(projectsByTime).forEach((time) => {
      const hours = projectsByTime[time][project] || 0;
      html += `<td class="isHour hour${time}" ${showHoursStyle}>${printHours(hours)}</td>`;
      html += `<td class="isPercent percent${time}"></td>`;
    });

    if (showTotalColumn(projectsByTime)) {
      html += `<td class="isHour isTotal" ${showHoursStyle}></td>`;
      html += '<td class="isPercent isTotal"></td>';
      html += '</tr>';
    }
  });

  html += '<tr class="total">';
  html += '<td>Totalt</td>';
  Object.keys(projectsByTime).forEach((time) => {
    html += `<td class="isHour hour${time}" ${showHoursStyle}></td>`;
    html += `<td class="isPercent percent${time}"></td>`;
  });
  if (showTotalColumn(projectsByTime)) {
    html += `<td class="isHour isTotal" ${showHoursStyle}></td>`;
    html += '<td class="isPercent isTotal"></td>';
  }
  html += '</tr>';

  html += '</table>';

  if (getUseInternalCommentsSetting() && warnings.length > 0) {
    html += '<p class="warning">';
    html += 'Följande datum har intern kommentar och behöver uppdateras från dagvyn: ';
    html += warnings.map((dateKey) => {
      const isoDate = `${dateKey.substring(0, 4)}-${dateKey.substring(4, 6)}-${dateKey.substring(6, 8)}`;
      return `<nobr><a href="/HRM/Tid/Dagredovisning?datum=${isoDate}">${isoDate}</a></nobr>`;
    }).join(', ');
    html += '</p>';
  }

  return html;
};

const updateAll = () => {
  const wpNode = document.querySelector('#project-modal .workingPercent');
  const wp = Number.parseInt(wpNode.value, 10) / 100;
  const isShowingTotal = (
    document.querySelectorAll('#project-modal .header th[class*="header"]').length > 1
  );

  // Total hours each project
  if (isShowingTotal) {
    document.querySelectorAll('#project-modal .project').forEach((project) => {
      if (project.querySelector('input').checked) {
        let totalHours = 0;
        project.querySelectorAll('.isHour:not(.isTotal)').forEach((hour) => {
          const time = getTimeFromClassName(hour.className, 'hour');
          if (!isShowingTotal
              || document.querySelector(`#project-modal .header${time} input`).checked) {
            totalHours += parseHour(hour.innerText);
          }
        });
        project.querySelector('.isHour.isTotal').innerText = printHours(totalHours);
      } else {
        project.querySelector('.isHour.isTotal').innerText = '';
      }
    });
  }

  // Total hours each time
  document.querySelectorAll('#project-modal .total .isHour:not(.isTotal)').forEach((totalHour) => {
    let totalHours = 0;
    const time = getTimeFromClassName(totalHour.className, 'hour');
    document.querySelectorAll(`#project-modal .project .hour${time}`).forEach((hour) => {
      if (hour.parentElement.querySelector('input').checked) {
        totalHours += parseHour(hour.innerText);
      }
    });
    totalHour.innerText = printHours(totalHours);
  });

  // Total hours
  if (isShowingTotal) {
    let totalHours = 0;
    document.querySelectorAll('#project-modal .project .isHour.isTotal').forEach((hour) => {
      totalHours += parseHour(hour.innerText);
    });
    document.querySelector('#project-modal .total .isHour.isTotal').innerText = (
      printHours(totalHours)
    );
  }

  // Percent each project and time
  document.querySelectorAll('#project-modal .project').forEach((project) => {
    project.querySelectorAll('.isPercent:not(.isTotal)').forEach((percent) => {
      const time = getTimeFromClassName(percent.className, 'percent');
      if (project.querySelector('input').checked
        && ((!isShowingTotal
          || document.querySelector(`#project-modal .header${time} input`).checked))) {
        const hours = parseHour(project.querySelector(`.hour${time}`).innerText);
        const totalHoursNode = document.querySelector(`#project-modal .total .hour${time}`);
        const totalHours = parseHour(totalHoursNode.innerText);
        percent.innerText = totalHours ? printPercent((hours / totalHours) * wp) : '';
      } else {
        percent.innerText = '';
      }
    });
  });

  // Percent total each time
  document.querySelectorAll('#project-modal .total .isPercent:not(.isTotal)').forEach((percent) => {
    const time = getTimeFromClassName(percent.className, 'percent');
    const totalHoursNode = document.querySelector(`#project-modal .total .hour${time}`);
    const totalHours = parseHour(totalHoursNode.innerText);
    if ((!isShowingTotal || document.querySelector(`#project-modal .header${time} input`).checked)
      && totalHours) {
      percent.innerHTML = printPercent(wp);
    } else {
      percent.innerHTML = '';
    }
  });

  // Percent total each project
  document.querySelectorAll('#project-modal .project .isPercent.isTotal').forEach((percent) => {
    if (percent.parentElement.querySelector('input').checked) {
      const hours = parseHour(percent.parentElement.querySelector('.isHour.isTotal').innerText);
      const totalHoursNode = document.querySelector('#project-modal .total .isHour.isTotal');
      const totalHours = parseHour(totalHoursNode.innerText);
      percent.innerText = totalHours ? printPercent((hours / totalHours) * wp) : '';
    } else {
      percent.innerHTML = '';
    }
  });

  // Percent total
  if (isShowingTotal) {
    const totalHoursNode = document.querySelector('#project-modal .total .isHour.isTotal');
    const totalHours = parseHour(totalHoursNode.innerText);
    document.querySelector('#project-modal .total .isPercent.isTotal').innerText = totalHours
      ? printPercent(wp)
      : '';
  }
};

// eslint-disable-next-line no-unused-vars
const showWeeks = () => {
  const tableHtml = createTableHtml(getStorageProjectsByWeek(), getShowHoursSetting());

  document.querySelector('#modal-body').innerHTML = tableHtml;
  updateStorageSettings();
  updateStorageChecked();
  updateStorageWarnings();
  updateAll();
};

// eslint-disable-next-line no-unused-vars
const showMonths = () => {
  const tableHtml = createTableHtml(getStorageProjectsByMonth(), getShowHoursSetting());

  document.querySelector('#modal-body').innerHTML = tableHtml;
  updateStorageSettings();
  updateStorageChecked();
  updateStorageWarnings();
  updateAll();
};

// eslint-disable-next-line no-unused-vars
const showHours = () => {
  const projectsByTime = getShowWeeksSetting()
    ? getStorageProjectsByWeek()
    : getStorageProjectsByMonth();
  const tableHtml = createTableHtml(projectsByTime, getShowHoursSetting());

  document.querySelector('#modal-body').innerHTML = tableHtml;
  updateStorageSettings();
  updateStorageChecked();
  updateStorageWarnings();
  updateAll();
};

// eslint-disable-next-line no-unused-vars
const useInternalComments = () => {
  clearStorageProjects();
  // eslint-disable-next-line no-use-before-define
  execute();
};

const createStyleCss = () => `
  #project-modal {
      background: rgba(0.5, 0.5, 0.5, 0.8);
      color: white;
      font-size: 15px; 
      height: 100%; 
      left: 0; 
      line-height: 1.5; 
      padding: 20px; 
      position: fixed; 
      top: 0; 
      width: 100%; 
      z-index: 100;
  }
  
  #modal-body {
    max-width: calc(100vw - 40px);
  }

  #project-modal p {
      max-width: 900px;
  }

  #project-modal p.warning {
    background-position: 0 2px;
    line-height: 1.5;
    margin-top: 0px;
    padding-top: 0;
  }

  #project-modal a {
      border: 1px solid white; 
      display: inline-block;
      margin-right: 15px; 
      margin-top: 15px; 
      padding: 5px 10px; 
  }

  #project-modal p.warning a {
    border: none;
    display: inline;
    margin: 0;
    padding: 0;
    text-decoration: underline;
  }

  #project-modal table a {
    border: none;
    display: inline;
    padding: 0;
    margin: 0;
  }

  #project-modal input.workingPercent {
      background-color: transparent;
      border: 1px solid white; 
      color: white; 
      font-size: 15px; 
      margin-bottom: 15px;
      padding-right: 5px; 
      text-align: right; 
      width: 40px;
  }

  #project-modal input[type="radio"][name="time"] {
      margin: 0 5px 0 25px;
  }

  #project-modal input[type="radio"][value="month"] {
      margin-left: 10px;
  }

  #project-modal input[type="checkbox"][name="showHours"],
  #project-modal input[type="checkbox"][name="useInternalComments"] {
      margin: 0 5px 0 25px;
  }

  #project-modal table {
      display: block; 
      overflow-x: scroll; 
      padding-bottom: 20px;
      white-space: nowrap;
  }

  #project-modal .header {
      border-bottom: 1px solid white; 
  }

  #project-modal tr {
      height: 30px;
  }

  #project-modal tr.total {
      border-top: 1px solid white
  }

  #project-modal th {
      padding: 3px 20px 3px 0;
      text-align: left;
  }
  
  #project-modal td {
      padding: 3px 20px 3px 0;
  }    

  #project-modal tr.total td {
      vertical-align: bottom;
  }

  #project-modal .isHour {
      padding-right: 10px;
      text-align: right;
      width: 50px;
  }    

  #project-modal .isPercent {
      text-align: right;
      width: 40px;
  }    

  #project-modal th:last-of-type, #project-modal td:last-of-type {
      padding-right: 0;
  }  

  #project-modal input {
      margin-right: 5px;
  }
`;

// eslint-disable-next-line no-unused-vars
const execute = (wp) => {
  updateStorage();

  const settings = getStorageSettings();
  const projectsByTime = settings.time === 'week'
    ? getStorageProjectsByWeek()
    : getStorageProjectsByMonth();
  const tableHtml = createTableHtml(projectsByTime, settings.showHours);

  showModal(tableHtml, createStyleCss());
  document.querySelector('#project-modal .workingPercent').value = wp || settings.wp;

  updateAll();
};
