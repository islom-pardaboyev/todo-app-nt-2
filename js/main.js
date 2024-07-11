"use strict";

const form = document.querySelector("form");
const todosCon = document.querySelector("#todosCon");
const showAllTodos = document.querySelector("#showAllTodos");
const showCompletedTodos = document.querySelector("#showCompletedTodos");
const showUncompletedTodos = document.querySelector("#showUncompletedTodos");
const showDeletedTodos = document.querySelector("#showDeletedTodos");
const showAllTodosLength = document.querySelector(".showAllTodosLength");
const showCompletedTodosLength = document.querySelector(".showCompletedTodosLength");
const showUncompletedTodosLength = document.querySelector(".showUncompletedTodosLength");
const showDeletedTodosLength = document.querySelector(".showDeletedTodosLength");
const wrapperModal = document.querySelector("#wrapperModal");
const elChooseInput = document.querySelector(".choose-input");
const elChoosenImg = document.querySelector(".choose-img");

let todoArr = JSON.parse(localStorage.getItem('todos')) || [];
let deletedTodoArr = JSON.parse(localStorage.getItem('deletedTodos')) || [];
let choosenImgCreate = null;
let choosenImgEdit = null;

showDeletedTodos.addEventListener("click", () => handleFilterTodos(deletedTodoArr, 'No deleted todos yet'));
showAllTodos.addEventListener("click", () => handleFilterTodos(todoArr, "No todos yet"));
showCompletedTodos.addEventListener('click', () => handleFilterTodos(todoArr.filter(todo => todo.completed), 'No completed todos yet'));
showUncompletedTodos.addEventListener('click', () => handleFilterTodos(todoArr.filter(todo => !todo.completed), 'No uncompleted todos yet'));
form.addEventListener("submit", submitForm);
elChooseInput.addEventListener('change', fileChangeCreate);
wrapperModal.addEventListener('click', modal);

function handleFilterTodos(arr, emptyMessage) {
    if (arr.length === 0) {
        todosCon.innerHTML = `<h1 class="font-bold text-center text-gray-500">${emptyMessage}</h1>`;
    } else {
        renderTodos(arr, todosCon);
    }
}

function submitForm(e) {
    e.preventDefault();
    const todoValue = e.target[0].value.trim();
    if (todoValue) {
        const todoObj = {
            id: Date.now(),
            title: todoValue,
            imgUrl: choosenImgCreate,
            completed: false
        };

        if (!todoArr.some(item => item.title === todoObj.title)) {
            todoArr.push(todoObj);
            saveTodos();
            e.target.reset();
            choosenImgCreate = null;
            elChoosenImg.src = '/images/choose.png';
            renderTodos(todoArr, todosCon);
            updateTodosLength();
        } else {
            alert("This Todo already exists");
        }
    } else {
        alert("Todo cannot be empty");
    }
}

function fileChangeCreate(e) {
    const file = e.target.files[0];
    if (file) {
        choosenImgCreate = URL.createObjectURL(file);
        elChoosenImg.src = choosenImgCreate;
    } else {
        choosenImgCreate = null;
        elChoosenImg.src = '/images/choose.png';
    }
}

function modal(e) {
    if (e.target.id === "wrapperModal") {
        wrapperModal.classList.remove("!top-0");
    }
}

function renderTodos(arr, list) {
    list.innerHTML = "";
    arr.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "flex p-2 rounded-md border border-black items-center justify-between";
        li.innerHTML = `
            <div class="flex items-center">
                <p class="font-semibold text-gray-500 text-lg">${index + 1}</p>
                <input id="title-${todo.id}" type="checkbox" ${todo.completed ? "checked" : ""} class="ml-2 scale-125 font-medium">
                <label for="title-${todo.id}" class="cursor-pointer ${todo.completed ? "line-through text-gray-500" : ""} select-none text-xl font-bold ml-3">${todo.title}</label>
            </div>
            <div class="flex items-center gap-3">
                <img width="100" height="100" src="${todo.imgUrl || 'https://placehold.co/600x400/white/black/?text=Img+Not+Selected&font=raleway'}" alt="Image">
                <i class="fa-regular p-2 rounded-md text-white cursor-pointer duration-300 hover:bg-green-500 font-bold bg-green-500/50 fa-pen-to-square" onclick="editTodo(${todo.id})"></i>
                <i class="fa-regular p-2 rounded-md text-white cursor-pointer duration-300 hover:bg-red-500 font-bold bg-red-500/50 fa-square-minus" onclick="deleteTodo(${todo.id})"></i>
            </div>
        `;
        li.querySelector("input").addEventListener("click", () => {
            todo.completed = !todo.completed;
            saveTodos();
            renderTodos(todoArr, todosCon);
            updateTodosLength();
        });

        list.append(li);
    });
}

function deleteTodo(id) {
    const todoToDelete = todoArr.find(todo => todo.id === id);
    if (todoToDelete) {
        deletedTodoArr.push(todoToDelete);
        todoArr = todoArr.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos(todoArr, todosCon);
        updateTodosLength();
    }
}

function editTodo(id) {
    const findTodo = todoArr.find(item => item.id === id);
    if (findTodo) {
        choosenImgEdit = findTodo.imgUrl;
        wrapperModal.classList.add("!top-0");
        wrapperModal.innerHTML = `
            <div class="absolute top-[50%] left-[50%] w-[600px] bg-pink-400 text-white translate-x-[-50%] translate-y-[-50%]">
                <div class="flex flex-col items-center justify-center p-5">
                    <h2 class="font-bold text-2xl">Edit Todo</h2>
                    <div class="flex flex-col gap-5 box-border">
                        <input type="text" id="editTodoInput" class="w-full text-black px-3 py-2 rounded-md" placeholder="Edit todo" value="${findTodo.title}">
                        <label class="relative group overflow-hidden cursor-pointer">
                            <input class="hidden" id="imgg" type="file">
                            <img src="${findTodo.imgUrl || '/images/choose.png'}" class="choose-img w-[500px] h-full" alt="">
                            <div class="absolute top-[100%] group-hover:top-0 duration-300 left-0 bg-black/80 w-full h-full">
                            <h1 class="flex items-center justify-center min-h-full text-white font-bold">Click here for edit img <br> and click save button</h1>
                            </div>
                        </label>
                        <button onclick="updateTodo(${id})" class="w-full px-3 py-2 mt-3 bg-clifford hover:bg-clifford/60 duration-300 text-white rounded-md">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('imgg').addEventListener('change', fileChangeEdit);
    }
}

function fileChangeEdit(e) {
    const file = e.target.files[0];
    if (file) {
        choosenImgEdit = URL.createObjectURL(file);
        document.querySelector(".choose-img").src = "/images/choose.png";
    }
}

function updateTodo(id) {
    const findTodo = todoArr.find(item => item.id === id);
    if (findTodo) {
        const updatedTitle = document.getElementById('editTodoInput').value.trim();
        if (updatedTitle) {
            findTodo.title = updatedTitle;
            if (choosenImgEdit) {
                findTodo.imgUrl = choosenImgEdit;
            }
            saveTodos();
            renderTodos(todoArr, todosCon);
            updateTodosLength();
            wrapperModal.classList.remove("!top-0");
            choosenImgEdit = null;
        } else {
            alert("Please fill the input");
        }
    }
}

function updateTodosLength() {
    showAllTodosLength.textContent = todoArr.length;
    showCompletedTodosLength.textContent = todoArr.filter(todo => todo.completed).length;
    showUncompletedTodosLength.textContent = todoArr.filter(todo => !todo.completed).length;
    showDeletedTodosLength.textContent = deletedTodoArr.length;
}

function saveTodos() {
    window.localStorage.setItem('todos', JSON.stringify(todoArr));
    window.localStorage.setItem('deletedTodos', JSON.stringify(deletedTodoArr));
}

renderTodos(todoArr, todosCon);
updateTodosLength();
