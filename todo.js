export function initializeTodoList() {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");

    chrome.storage.local.get(["tasks"], (result) => {
        if (result.tasks) {
            result.tasks.forEach(addTaskToUI);
        }
    });

    addTaskButton.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;

        chrome.storage.local.get(["tasks"], (result) => {
            const tasks = result.tasks || [];
            tasks.push(taskText);
            chrome.storage.local.set({ tasks }, () => addTaskToUI(taskText));
        });

        taskInput.value = "";
    });

    function addTaskToUI(taskText) {
        const li = document.createElement("li");

        const taskDiv = document.createElement("div");
        taskDiv.className = "task-text";
        taskDiv.textContent = taskText;

        const removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.id = "removeButton";
        removeButton.addEventListener("click", () => {
            li.remove();
            chrome.storage.local.get(["tasks"], (result) => {
                const tasks = result.tasks.filter((task) => task !== taskText);
                chrome.storage.local.set({ tasks });
            });
        });

        li.appendChild(taskDiv);
        li.appendChild(removeButton);
        taskList.appendChild(li);
    }
}
