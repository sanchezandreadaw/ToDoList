import { formatState, formatDate, sortTasksByDate} from "./helpers/service.js";

const tableContainer = document.querySelector('#table-container');
export let idsArrayInterface = [];

export function createTable(data) {
    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-gray-800', 'rounded-lg', 'shadow-md', 'overflow-x-auto');

    const thead = createTableHeader();
    const tbody = createTableBody(data);

    table.appendChild(thead);
    table.appendChild(tbody);

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

function createTableHeader() {
    const thead = document.createElement('thead');
    thead.classList.add('bg-teal-800', 'text-white');

    const headerRow = document.createElement('tr');

    const headerCell = createTableHeaderCell('Tarea', 'fa-tasks');
    const priorityCell = createTableHeaderCell('Prioridad', 'fa-star');
    const dateCell = createTableHeaderCell('Fecha', 'fa-calendar');
    const completedCell = createTableHeaderCell('Completada', 'fa-check');
    const editCell = createTableHeaderCell('Editar', 'fa-edit');

    headerRow.appendChild(headerCell);
    headerRow.appendChild(priorityCell);
    headerRow.appendChild(dateCell);
    headerRow.appendChild(completedCell); 
    headerRow.appendChild(editCell);

    thead.appendChild(headerRow);
    return thead;
}

function createTableHeaderCell(text, iconClass) {
    const headerCell = document.createElement('th');
    headerCell.classList.add('px-6', 'py-3', 'font-semibold', 'text-white');


    const container = document.createElement('div');
    container.classList.add('flex', 'items-center', 'justify-center', 'gap-2');


    const textElement = document.createElement('span');
    textElement.textContent = text;
    container.appendChild(textElement);


    if (iconClass) {
        const icon = createIcon(iconClass);
        container.appendChild(icon);
    }

    headerCell.appendChild(container);
    return headerCell;
}

const areIcons = (...elements) => elements.every(element => element.tagName === 'I');

function createTableBody(data) {
    const tbody = document.createElement('tbody');
    tbody.classList.add('divide-y', 'divide-gray-700', 'bg-gray-900', 'text-center');


    data.forEach((value) => {
        const tr = document.createElement('tr');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.idCheckbox = value.id;

        tr.classList.add('hover:bg-gray-800');

        const tdName = createTableCell(value.name);
        tdName.dataset.nameTask = value.name;

        const tdDate = createTableCell(formatDate(new Date(value.date)));
        tdDate.dataset.dateTask = value.date

        const tdPriority = createTableCell(formatState(value.priority));
        tdPriority.dataset.priorityTask = value.priority;

        const tdCompleted = document.createElement('td');
        tdCompleted.appendChild(checkbox);

        const tdEdit = document.createElement('td');
        const iconEdit = createIcon('fa-pencil-alt');
        const trashIcon = createIcon('fa-trash');
        

        trashIcon.dataset.taskId = value.id;
        iconEdit.dataset.taskId = value.id;

        tdEdit.appendChild(iconEdit);
        tdEdit.appendChild(trashIcon);

        if (areIcons(iconEdit, trashIcon)) {
            [iconEdit, trashIcon].forEach(i => {
                i.style.margin = '10px';
            });
        }

        tdEdit.style.textAlign = 'center';

        tr.appendChild(tdName);
        tr.appendChild(tdPriority);
        tr.appendChild(tdDate);
        tr.appendChild(tdCompleted);
        tr.appendChild(tdEdit);

        tbody.appendChild(tr);
    });

    return tbody;
}

function createTableCell(content) {
    const td = document.createElement('td');
    td.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-gray-200');
    td.textContent = content;
    return td;
}

function createIcon(iconClass) {
    const icon = document.createElement('i');
    icon.classList.add('fas', iconClass);
    return icon;
}



export function updateInterface(data = []) {
    tableContainer.innerHTML = '';

    if (data.length === 0) {
        const parrafo = document.createElement('p');
        parrafo.classList.add('text-xl', 'text-gray-400', 'text-center');
        parrafo.style.margin = '80px';
        parrafo.textContent = 'No existen tareas pendientes';
        tableContainer.appendChild(parrafo);
    } else {
        const sortedData = sortTasksByDate(data);
        createTable(sortedData);
    }

}


export function showAlert(message, type) {
    const modal = document.getElementById('alert-modal');
    const modalContent = document.getElementById('modal-content');
    const modalMessage = document.getElementById('modal-message');

    modal.classList.remove('hidden');
    modalMessage.classList.add('whitespace-nowrap');
    modalMessage.textContent = message;

    modalContent.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500');
    modalContent.classList.add('text-white');

    switch(type) {
        case 'success': modalContent.classList.add('bg-green-500');
                        break;
        case 'error' :  modalContent.classList.add('bg-red-500');
                        break;
        case 'info':    modalContent.classList.add('bg-blue-500');
                        break;

        default : modalContent.classList.add('bg-yellow-500');

    }

    closeModal(modal);
}


function closeModal(modal) {
    const modalClose = document.querySelector('#modal-close');

    const handleClickOutside = (event) => {
        if (modal && !modal.contains(event.target) && event.target !== modalClose) {
            modal.classList.add('hidden');
        }
    };

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    document.addEventListener('click', handleClickOutside);

}

//Elementos del formulario 'editar tarea'
export const inputEdit = document.querySelector('#nombreEdit');
export const inputPriorityEdit = document.querySelector('#prioridadEdit');
export const inputDateEdit = document.querySelector('#fechaEdit');
export const formEditTask = document.querySelector('#editTask-form');

const containsReadOnly = (...elements) => elements.some(el => el.hasAttribute('readonly'));

export const warningMessage = () => {
    showAlert(
        `Para modificar alguna tarea, primero haga click en el icono del lápiz de la tarea a editar`, ''
    );
}
export function showWarning() {


    if (containsReadOnly(inputEdit, inputPriorityEdit)) {
        formEditTask.addEventListener('keydown', warningMessage);
    } else {
        formEditTask.removeEventListener('keydown',warningMessage);
    }

}

showWarning();




