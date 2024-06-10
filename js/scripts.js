const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoDescInput = document.querySelector("#todo-desc-input");
const todoPriorityInput = document.querySelector("#todo-priority");
const todoDueDateInput = document.querySelector("#todo-due-date");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const editDescInput = document.querySelector("#edit-desc-input");
const editPriorityInput = document.querySelector("#edit-priority");
const editDueDateInput = document.querySelector("#edit-due-date");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");

let oldInputValue;

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  const day = String(dateObj.getDate() + 1).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

const saveTodo = (text, desc, priority, dueDate, done = 0, save = 1) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const todoDesc = document.createElement("p");
  todoDesc.innerText = desc;
  todo.appendChild(todoDesc);

  const todoPriority = document.createElement("p");
  todoPriority.innerText = `${priority}`;
  todo.appendChild(todoPriority);

  const todoDueDate = document.createElement("p");
  todoDueDate.innerText = formatDate(`${dueDate}`);
  todo.appendChild(todoDueDate);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  updateTodoColors(todo, dueDate);

  if (done) {
    todo.classList.add("done");
  }

  if (save) {
    saveTodoLocalStorage({ text, desc, priority, dueDate, done: 0 });
  }

  todoList.appendChild(todo);

  todoInput.value = "";
  todoDescInput.value = "";
  todoPriorityInput.value = "Baixa";
  todoDueDateInput.value = "";
};

const updateTodoColors = (todo, dueDate) => {
  const currentDate = new Date();
  const dueDateObj = new Date(dueDate);
  const timeDiff = dueDateObj - currentDate;
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

  todo.classList.remove("due-soon", "overdue");
  if (dayDiff < 0) {
    todo.classList.add("overdue");
  } else if (dayDiff <= 3) {
    todo.classList.add("due-soon");
  }
};

const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

const updateTodo = (text, desc, priority, dueDate) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");
    let todoDesc = todo.querySelector("p");
    let todoPriority = todo.querySelector("p:nth-of-type(2)");
    let todoDueDate = todo.querySelector("p:nth-of-type(3)");

    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = text;
      todoDesc.innerText = desc;
      todoPriority.innerText = `${priority}`;
      todoDueDate.innerText = formatDate(`${dueDate}`);

      updateTodoColors(todo, dueDate);

      updateTodoLocalStorage(oldInputValue, text, desc, priority, dueDate);
    }
  });
};

const getSearchedTodos = (search) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    const todoTitle = todo.querySelector("h3").innerText.toLowerCase();

    todo.style.display = "flex";

    if (!todoTitle.includes(search)) {
      todo.style.display = "none";
    }
  });
};

const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");

  switch (filterValue) {
    case "all":
      todos.forEach((todo) => (todo.style.display = "flex"));
      break;

    case "done":
      todos.forEach((todo) =>
        todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    case "todo":
      todos.forEach((todo) =>
        !todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    default:
      break;
  }
};

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputValue = todoInput.value;
  const descValue = todoDescInput.value;
  const priorityValue = todoPriorityInput.value;
  const dueDateValue = todoDueDateInput.value;

  if (inputValue && descValue && priorityValue && dueDateValue) {
    saveTodo(inputValue, descValue, priorityValue, dueDateValue);
  }
});

document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");
  let todoTitle, todoDesc, todoPriority, todoDueDate;

  if (parentEl && parentEl.querySelector("h3")) {
    todoTitle = parentEl.querySelector("h3").innerText || "";
    todoDesc = parentEl.querySelector("p").innerText || "";
    todoPriority =
      parentEl.querySelector("p:nth-of-type(2)").innerText.split(": ")[1] || "";
    todoDueDate =
      parentEl.querySelector("p:nth-of-type(3)").innerText.split(": ")[1] || "";
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done");

    updateTodoStatusLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove();

    removeTodoLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("edit-todo")) {
    toggleForms();

    editInput.value = todoTitle;
    editDescInput.value = todoDesc;
    editPriorityInput.value = todoPriority;
    editDueDateInput.value = todoDueDate;
    oldInputValue = todoTitle;
  }
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const editInputValue = editInput.value;
  const editDescValue = editDescInput.value;
  const editPriorityValue = editPriorityInput.value;
  const editDueDateValue = editDueDateInput.value;

  if (
    editInputValue &&
    editDescValue &&
    editPriorityValue &&
    editDueDateValue
  ) {
    updateTodo(
      editInputValue,
      editDescValue,
      editPriorityValue,
      editDueDateValue
    );
  }

  toggleForms();
});

searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;

  getSearchedTodos(search);
});

eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();

  searchInput.value = "";

  searchInput.dispatchEvent(new Event("keyup"));
});

filterBtn.addEventListener("change", (e) => {
  const filterValue = e.target.value;

  filterTodos(filterValue);
});

const getTodosLocalStorage = () => {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  return todos;
};

const loadTodos = () => {
  const todos = getTodosLocalStorage();

  todos.forEach((todo) => {
    saveTodo(todo.text, todo.desc, todo.priority, todo.dueDate, todo.done, 0);
  });
};

const saveTodoLocalStorage = (todo) => {
  const todos = getTodosLocalStorage();

  todos.push(todo);

  localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();

  const filteredTodos = todos.filter((todo) => todo.text != todoText);

  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

const updateTodoStatusLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();

  todos.map((todo) =>
    todo.text === todoText ? (todo.done = !todo.done) : null
  );

  localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (
  todoOldText,
  todoNewText,
  todoNewDesc,
  todoNewPriority,
  todoNewDueDate
) => {
  const todos = getTodosLocalStorage();

  todos.map((todo) => {
    if (todo.text === todoOldText) {
      todo.text = todoNewText;
      todo.desc = todoNewDesc;
      todo.priority = todoNewPriority;
      todo.dueDate = todoNewDueDate;
    }
  });

  localStorage.setItem("todos", JSON.stringify(todos));
};

loadTodos();
