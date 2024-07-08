let form = document.querySelector("form");
let todosCon = document.querySelector("#todosCon");
let showAllTodos = document.querySelector("#showAllTodos");
let showCompletedTodos = document.querySelector("#showCompletedTodos");
let showUncompletedTodos = document.querySelector("#showUncompletedTodos");
let showDeletedTodos = document.querySelector("#showDeletedTodos");
let showAllTodosLength = document.querySelector(".showAllTodosLength");
let showCompletedTodosLength = document.querySelector(".showCompletedTodosLength");
let showUncompletedTodosLength = document.querySelector(".showUncompletedTodosLength");
let showDeletedTodosLength = document.querySelector(".showDeletedTodosLength");
let wrapperModal = document.querySelector("#wrapperModal");

let todoArr = loadFromLocalStorage('todoArr') || [];
let deletedTodoArr = loadFromLocalStorage('deletedTodoArr') || [];

showDeletedTodos.addEventListener("click", () => {
    if (deletedTodoArr.length == 0) {
        todosCon.innerHTML = '<h1 class="font-bold text-center text-gray-500">Not yet deleted todos</h1>';
    } else {
        renderTodos(deletedTodoArr, todosCon);
    }
});

showAllTodos.addEventListener("click", () => {
    renderTodos(todoArr, todosCon);
});

showCompletedTodos.addEventListener('click', () => {
    if (todoArr.filter(todo => todo.completed).length == 0) {
        todosCon.innerHTML = '<h1 class="font-bold text-center text-gray-500">Not yet completed todos</h1>';
    } else {
        renderTodos(todoArr.filter(todo => todo.completed), todosCon);
    }
});

showUncompletedTodos.addEventListener('click', () => {
    if (todoArr.filter(todo => !todo.completed).length == 0) {
        todosCon.innerHTML = '<h1 class="font-bold text-center text-gray-500">Not yet uncompleted todos</h1>';
    } else {
        renderTodos(todoArr.filter(todo => !todo.completed), todosCon);
    }
});

form.addEventListener("submit", e => {
    e.preventDefault();

    const todoValue = e.target[0].value.trim();

    const todoObj = {
        id: todoArr.length,
        title: todoValue,
        completed: false
    };
    const existingTodo = todoArr.find((item) => item.title == todoObj.title);
    if (!existingTodo) {
        todoArr.push(todoObj);
    } else {
        alert("This Todo is already exist");
    }
    e.target.reset();
    todosCon.classList.remove("hidden");
    renderTodos(todoArr, todosCon);
    updateTodosLength();
    saveToLocalStorage('todoArr', todoArr);
});

function renderTodos(arr, list) {
    list.innerHTML = "";
    arr.forEach((todo, index) => {
        let li = document.createElement("li");
        li.className = "flex p-2 rounded-md border border-black items-center justify-between";
        li.innerHTML = `
            <div class="flex items-center">
                <p class="font-semibold text-gray-500 text-lg">${index + 1}</p>
                <input type="checkbox" ${todo.completed ? "checked" : ""} class="ml-2 scale-125 font-medium">
                <label class="cursor-pointer ${todo.completed ? "line-through text-gray-500" : ""} select-none text-xl font-bold ml-3">${todo.title}</label>
            </div>
            <div class="flex items-center gap-3">
                <i class="fa-regular p-2 rounded-md text-white cursor-pointer duration-300 hover:bg-green-500 font-bold bg-green-500/50 fa-pen-to-square" onclick="editTodo(${todo.id})"></i>
                <i class="fa-regular p-2 rounded-md text-white cursor-pointer duration-300 hover:bg-red-500 font-bold bg-red-500/50 fa-square-minus" onclick="deleteTodo(${todo.id})"></i>
            </div>
        `;
        li.querySelector("input").addEventListener("click", () => {
            todo.completed = !todo.completed;
            renderTodos(todoArr, todosCon);
            updateTodosLength();
            saveToLocalStorage('todoArr', todoArr);
        });
        list.append(li);
    });
}

function deleteTodo(id) {
    const todoToDelete = todoArr.find(todo => todo.id === id);
    if (todoToDelete) {
        deletedTodoArr.push(todoToDelete);
        todoArr = todoArr.filter(todo => todo.id !== id);
        renderTodos(todoArr, todosCon);
        saveToLocalStorage('todoArr', todoArr);
        saveToLocalStorage('deletedTodoArr', deletedTodoArr);
    }
    updateTodosLength();
}

function editTodo(id) {
    wrapperModal.classList.add("!top-0");
    const findTodo = todoArr.find(item => item.id == id);
    wrapperModal.innerHTML = `
        <div class="absolute top-[50%] left-[50%] w-[600px] h-[400px] bg-pink-400 text-white translate-x-[-50%] translate-y-[-50%]">
            <div class="flex flex-col items-center justify-center p-5">
                <h2 class="font-bold text-2xl">Edit Todo</h2>
                <div class="flex flex-col gap-3">
                    <input type="text" id="editTodoInput" class="w-full text-black px-3 py-2 rounded-md" placeholder="Edit todo" value="${findTodo.title}">
                    <button onclick={updateTodo(${id})} class="w-full px-3 py-2 mt-3 bg-clifford hover:bg-clifford/60 duration-300 text-white rounded-md">Save</button>
                </div>
            </div>
        </div>
    `;
}

function updateTodo(id) {
    const findTodo = todoArr.find(item => item.id == id);
    if (findTodo) {
        findTodo.title = document.getElementById('editTodoInput').value;
        renderTodos(todoArr, todosCon);
        updateTodosLength();
        saveToLocalStorage('todoArr', todoArr);
        wrapperModal.classList.remove("!top-0");
    }
}

wrapperModal.addEventListener('click', (e) => {
    if (e.target.id == "wrapperModal") {
        wrapperModal.classList.remove("!top-0");
    }
});

function updateTodosLength() {
    showAllTodosLength.textContent = todoArr.length;
    showCompletedTodosLength.textContent = todoArr.filter(todo => todo.completed).length;
    showUncompletedTodosLength.textContent = todoArr.filter(todo => !todo.completed).length;
    showDeletedTodosLength.textContent = deletedTodoArr.length;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

renderTodos(todoArr, todosCon);
updateTodosLength();