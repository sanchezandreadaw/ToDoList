import { updateInterface, showAlert, inputEdit, inputPriorityEdit, inputDateEdit, formEditTask, warningMessage,  } from "./interfaceElements.js";
import { validateTask, notEmpty, isValidLength, capitalizeFirstLetter, convertToReadOnly } from "./helpers/service.js";

let data = [];
const selectedIds = new Set();
let taskId;


document.addEventListener('DOMContentLoaded', () => {

    getDataToBBDD();
    

    const mensajeError = 'Error en la solicitud';
    const mensajeInvalidData = 'Los datos introducidos no son válidos';

    //elementos del formulario 'añadir tarea'
    const nameTaskInput = document.querySelector('#nombre');
    const priorityTaskInput = document.querySelector('#prioridad');
    const dateInputTask = document.querySelector('#fecha');
    const btnAddTask = document.querySelector('#btnAddTask');
    //const btnResetAddForm = document.querySelector('#resetAdd');
    const form = document.querySelector('#task-form');
    
    const btnEditTask = document.querySelector('#btnEditTask');

    //botón para resetear la App
    const btnResetApp = document.querySelector('#btnResetApp');

    const btnResetEditForm = document.querySelector('#resetEdit');
    const btnResetAddForm = document.querySelector('#resetAdd');

    document.addEventListener('input', () => notEmpty(btnAddTask, nameTaskInput, priorityTaskInput, dateInputTask));
    formEditTask.addEventListener('input', () => notEmpty(btnEditTask, inputEdit, inputPriorityEdit, inputDateEdit));

    btnResetApp.addEventListener('click', resetApp);

    btnResetEditForm.addEventListener('click', () => convertToReadOnly(inputEdit, inputPriorityEdit, inputDateEdit));

    
    function resetApp(e) {
        if (e) e.preventDefault();
    
        if (btnResetApp instanceof HTMLButtonElement) {
            data.forEach(task => {
                if (task.id) {
                    deleteTask(task.id, e);
                } else {
                    console.error('No existe el id');
                }
            });
    
            recalculateCompletionPercentage();
            resetForm();
        } else {
            console.error('El elemento no es un botón');
        }
    }

    function blockButtonIfReset(e) {
        if(e) e.preventDefault();

        btnResetAddForm.addEventListener('click', () => {
            btnAddTask.disabled = true;
        })
    }
    
    blockButtonIfReset();
    
    let taskIdUpdate = "";

      function loadCheckboxesStateFromLocalStorage() {
        const completedTasks = localStorage.getItem('completedTasks');
        if (completedTasks) {
            const completedTaskIds = JSON.parse(completedTasks);
            completedTaskIds.forEach(taskId => selectedIds.add(taskId));
        }
    }


    function updateCheckboxesStateInLocalStorage() {
        localStorage.setItem('completedTasks', JSON.stringify([...selectedIds]));
    }

 
    loadCheckboxesStateFromLocalStorage();



  async function getDataToBBDD() {
    try {
        const respuesta = await fetch('http://localhost:3000/tasks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error(`${mensajeError} : ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        data = Array.isArray(datos) ? datos : [];

        updateInterface(data);
        maintainCheckboxesState(); 

    } catch (error) {
        showAlert(`${mensajeError}. No ha sido posible obtener los datos`, 'error');
        console.error(`${error.message}`);
    }
}


    form.addEventListener('submit', addTask);

    formEditTask.addEventListener('submit', updateTask);

    async function addTask(e) {
        e.preventDefault();
    
        const task = {
            name: nameTaskInput.value,
            priority: priorityTaskInput.value,
            date: dateInputTask.value,
        };
    
        task.name = capitalizeFirstLetter(task.name);
    
        if (!isValidLength(data)) {
            showAlert('Elimina alguna tarea para poder agregar más', 'error');
            return;
        }
    
        if (validateTask(task)) {
            try {
                const respuesta = await fetch('http://localhost:3000/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                });
    
                if (!respuesta.ok) {
                    throw new Error(`${mensajeError} : ${respuesta.status}`);
                }
    
                const newTask = await respuesta.json();
                data.push(newTask);
    
                showAlert('Tarea añadida correctamente', 'success');
                updateInterface(data);
                resetForm();
                btnAddTask.disabled = true;
    
                maintainCheckboxesState(); 
    
            } catch (error) {
                console.error(`${mensajeError} : ${error.message}`);
            }
        } else {
            resetForm();
        }
    }
    
    
    async function deleteTask(taskId, e) {
        if (!taskId) {
            showAlert(`${mensajeError} : el id proporcionado no es válido`);
            return;
        }
    
        if (e) e.preventDefault();
    
        try {
            const respuesta = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!respuesta.ok) {
                throw new Error(`${mensajeError} : ${respuesta.status}`);
            }
    
            const nameDeletedTask = data.filter(task => task.id === taskId)[0];
            const { name } = nameDeletedTask;
            data = data.filter(task => task.id !== taskId);
    
            selectedIds.delete(taskId);
    
            if (e && e.target && e.target.id === 'btnResetApp') {
                showAlert('Aplicación reseteada correctamente', 'success');
                updateInterface(data);
                maintainCheckboxesState(); 
                return;
            }
    
            showAlert(`La tarea - "${name}", se ha eliminado correctamente`, 'success');
            updateInterface(data);
    
            maintainCheckboxesState(); 
    
        } catch (error) {
            showAlert(`${mensajeError} : ${error.message}`, 'error');
            console.error(`${mensajeError} : ${error.message}`);
        }
    }
    



    async function updateTask(e) {
        if (e) e.preventDefault();
    
        const taskUpdate = {
            name: inputEdit.value,
            priority: inputPriorityEdit.value,
            date: inputDateEdit.value
        };
    
        if (validateTask(taskUpdate)) {
            try {
                const respuesta = await fetch(`http://localhost:3000/tasks/${taskIdUpdate}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskUpdate)
                });
    
                if (!respuesta.ok) {
                    throw new Error(`${mensajeError} : ${respuesta.status}`);
                }
    
                const updatedTask = await respuesta.json();
    
                data = data.map(task => task.id === taskIdUpdate ? updatedTask : task);
    
                showAlert('Tarea actualizada correctamente', 'success');
                updateInterface(data);
                resetForm();
                convertToReadOnly(inputDateEdit, inputPriorityEdit, inputEdit);
                taskIdUpdate = '';
    
                maintainCheckboxesState(); 
    
            } catch (error) {
                showAlert(`${mensajeError} : ${error.message}`, 'error');
                console.error(`${mensajeError} : ${error.message}`);
            }
        } else {
            showAlert(`${mensajeInvalidData}`, 'error');
        }
    }

    function tableContainerDeleteIcon(e) {

        if (e.target.classList.contains('fa-trash')) {
            taskId = e.target.dataset.taskId;
            deleteTask(taskId);
        }
    }

    function tableContainerEditIcon(e) {

        if (e.target.classList.contains('fa-pencil-alt')) {
            taskId = e.target.dataset.taskId;
            taskIdUpdate = taskId;

            [inputEdit, inputPriorityEdit, inputDateEdit].forEach(input => input.removeAttribute('readonly'));
            formEditTask.removeEventListener('keydown', warningMessage);

            const nameTaskDataset = e.target.closest('tr').querySelector('[data-name-task]').dataset.nameTask;
            const priorityTaskDataset = e.target.closest('tr').querySelector('[data-priority-task]').dataset.priorityTask;
            const dateTaskDataset = e.target.closest('tr').querySelector('[data-date-task]').dataset.dateTask;

            inputEdit.value = nameTaskDataset;
            inputPriorityEdit.value = priorityTaskDataset;
            inputDateEdit.value = dateTaskDataset;
        }
    }
  
    function tableContainerCheckboxes(e) {
        if (e.target.type === 'checkbox') {
            const taskId = e.target.dataset.idCheckbox;
            if (taskId) {
                if (e.target.checked) {
                    selectedIds.add(taskId);
                } else {
                    selectedIds.delete(taskId);
                }

                updateCheckboxesStateInLocalStorage();
                recalculateCompletionPercentage();  
            }
        }
    }

    

    function tableEvents(idTable) {
        document.querySelector(idTable).addEventListener('click', tableContainerDeleteIcon);
        document.querySelector(idTable).addEventListener('click', tableContainerEditIcon);
        document.querySelector(idTable).addEventListener('click', tableContainerCheckboxes);

    }

 
   function maintainCheckboxesState() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const taskId = checkbox.dataset.idCheckbox;
        if (selectedIds.has(taskId)) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    recalculateCompletionPercentage();
}
    
function recalculateCompletionPercentage() {
    
    const totalTasks = document.querySelectorAll('input[type="checkbox"]').length;

   
    const completedTasks = document.querySelectorAll('input[type="checkbox"]:checked').length;

  
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

 
    const percentageDisplay = document.querySelector('#percentage-display');
    
    if (percentageDisplay) {
       
        percentageDisplay.textContent = `${completionPercentage.toFixed(0)}%`;
    }

  
    const progressCircle = document.querySelector('#progress-circle');
    if (progressCircle) {
     
        const dashOffset = 283 - (283 * (completionPercentage / 100));
        progressCircle.style.strokeDashoffset = dashOffset;
    }
}


    tableEvents('#table-container');


    function resetForm() {
        const inputs = document.querySelectorAll('input');
        const forms = document.querySelectorAll('form');

        inputs.forEach(input => input.value = '');

        forms.forEach(form => {

            if (form instanceof HTMLFormElement) {
                form.reset();
            } else {
                console.warn('Elemento no es un formulario:', form);
            }
        });
    }

});
