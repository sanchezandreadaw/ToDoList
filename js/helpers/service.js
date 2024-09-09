import { showAlert, showWarning } from "../interfaceElements.js";

export function validateTask(task) {

    const validateName = /^[A-Za-záéíóúÁÉÍÓÚñÑçÇ0-9\s:._;,-]{3,150}$/;

    const validPriorities = ['media', 'baja', 'alta'];
    const isValidPriority = validPriorities.includes(task.priority.toString().toLowerCase());

    const isValidName = task.name !== '' && validateName.test(task.name);

    const isValidDate = validateDate(task.date);

    if(!isValidDate) {
        showAlert('La fecha seleccionada no puede ser anterior al día de hoy', 'error');
    }

    if(!isValidName) {
        showAlert('El nombre introducido no es válido', 'error');
    }

    if(!isValidPriority) {
        showAlert('La prioridad introducida no es válida', 'error');
    }

    return isValidPriority && isValidName && isValidDate;
}

export const convertToReadOnly = (...elements) => {
    elements.forEach(element => element.setAttribute('readonly', true));
    showWarning();
};

export const notEmpty = (btnSubmit = null, ...elements) => {

    const isValidInput = elements.every(element => element !== '');

    if (btnSubmit) {
        btnSubmit.disabled = !isValidInput;
    }
};


const MIN_LENGTH = 0;
const MAX_LENGTH = 9;

export const isValidLength = (data) => {

    if(typeof data !== 'object') return;

    return data.length >= MIN_LENGTH && data.length <=MAX_LENGTH;
}

export function formatState(state) {

    if (typeof state !== 'string' && typeof state !== 'boolean') {
        console.error('El estado debe ser una cadena de texto o un valor booleano');
        return 'Estado inválido';
    }


    if (typeof state === 'string') {
        const stateLower = state.toLowerCase();
        if (stateLower === 'media') {
            return 'Media';
        } else if (stateLower === 'alta') {
            return 'Alta';
        } else if (stateLower === 'baja') {
            return 'Baja';
        } else {
            return 'Prioridad desconocida';
        }
    }

    if (typeof state === 'boolean') {
        return state ? 'Completada' : 'Pendiente';
    }
}

export const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0) === str.charAt(0).toUpperCase()
        ? str
        : str.charAt(0).toUpperCase() + str.slice(1);
};

const priorityOrder = {
    'Alta': 1,
    'media': 2,
    'baja': 3
};

export function sortTasksByPriority(tasks) {
    return tasks.sort((a, b) => {

        const priorityA = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : Number.MAX_SAFE_INTEGER;
        const priorityB = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : Number.MAX_SAFE_INTEGER;

        //console.log(`Comparando ${a.priority} (${priorityA}) con ${b.priority} (${priorityB})`);

        return priorityB - priorityA;
    });
}

export function sortTasksByDate(tasks, ascending = true) {
    return tasks.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA.getTime() === dateB.getTime()) {

            const priorityA = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority]
             : Number.MAX_SAFE_INTEGER;
            const priorityB = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority]
             : Number.MAX_SAFE_INTEGER;

            return priorityA - priorityB;
        }

        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {day : '2-digit', month : '2-digit', year : 'numeric'}).format(date);
}

function validateDate(date) {
    const dateUser = new Date(date);
    const today = new Date();

    // establecer la hora en 00:00:00
    today.setHours(0, 0, 0, 0);
    dateUser.setHours(0, 0, 0, 0);

    return dateUser.getTime() >= today.getTime();
}


export function showNotifications(message) {
    if (Notification.permission === 'granted') {
        new Notification('Información', {
            body: message
        });
    } else if (Notification.permission !== 'denied') {
        //Solicitar permiso en caso de que no haya sido denegado
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Información', {
                    body: message
                });
            }
        });
    }
}

