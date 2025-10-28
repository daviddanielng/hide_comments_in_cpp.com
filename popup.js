let errorTimeToClearId = undefined;
function switchTab(tab) {
  const [mainTab, configTab] = getTabs();
  const [mainController, configController] = getTabControllers();
  if (mainTab && configTab && mainController && configController) {
    if (tab === "main") {
      mainTab.style.display = "flex";
      configTab.style.display = "none";
      mainController.classList.add("active");
      configController.classList.remove("active");
    } else if (tab === "config") {
      mainTab.style.display = "none";
      configTab.style.display = "block";
      configController.classList.add("active");
      mainController.classList.remove("active");
      buildConfigUI();
    }
  }
}
function getLastTab() {
  return "config";
}
function getConfig() {
  return [
    { type: "name", text: "Hello", id: "1" },
    { type: "comment", text: "done", id: "2" },
  ];
}
function buildConfigUI() {
  const config = getConfig();
  const container = document.getElementById("config-list");
  if (!container) return;
  const html = [];
  for (let i = 0; i < config.length; i++) {
    html.push(`<li style="padding: 10px; border-bottom: 1px solid #ccc; display: flex">
        <div style="flex-grow: 1">${config[i].text} (${config[i].type})</div>
        <div>
          <button data-action="edit" data-id="${config[i].id}" data-type="${config[i].type}" data-text="${config[i].text}">Edit</button>
          <button data-action="delete" data-id="${config[i].id}">Delete</button>
        </div>
      </li>`);
  }
  container.innerHTML = html.join("");

  container.querySelectorAll('button[data-action="edit"]').forEach((button) => {
    button.addEventListener("click", () => {
      handleEdit(
        button.getAttribute("data-id"),
        button.getAttribute("data-type"),
        button.getAttribute("data-text")
      );
    });
  });

  container
    .querySelectorAll('button[data-action="delete"]')
    .forEach((button) => {
      button.addEventListener("click", () =>
        deleteConfig(button.getAttribute("data-id"))
      );
    });
}
function handleEdit(id, type, text) {
  console.log("Edit config with id:", id);
  const [modifyContainer] = getConfigSubContainers();
  if (!modifyContainer) {
    console.error("Modify container not found");
    return;
  }
  if (!id || !type || !text) {
    showMessage("Invalid config data for editing", "error");
    return;
  }

  modifyContainer.setAttribute("data-edit-id", id);
  modifyContainer.querySelector("select").value = type;
  modifyContainer.querySelector("input[name='config-text']").value = text;

  showAddForm();
}

function getTabControllers() {
  const mainController = document.getElementById("main-controller");
  const configController = document.getElementById("config-controller");
  return [mainController, configController];
}
function getTabs() {
  const mainTab = document.getElementById("main-tab");
  const configTab = document.getElementById("config-tab");
  return [mainTab, configTab];
}

function getConfigSubContainers() {
  const modifyContainer = document.getElementById("modify-add-config");
  const configViewContainer = document.getElementById("config-view-container");
  return [modifyContainer, configViewContainer];
}
function hideComments() {
  const config = getConfig();
  // Find the currently active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // Execute the content.js script on that tab
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      });
    } else {
      console.error("Could not find active tab.");
    }
  });
}
function saveConfig() {
  const modifyContainer = document.getElementById("modify-add-config");
  if (!modifyContainer) {
    console.error("Modify container not found");
    return;
  }
  const typeSelect = modifyContainer.querySelector("select");
  const textInput = modifyContainer.querySelector("input[name='config-text']");
  if (!typeSelect || !textInput) {
    console.error("Type or text input not found");
    return;
  }
  const type = typeSelect.value;
  const text = textInput.value;
  console.log("Saving config:", { type, text });
  if (!type) {
    showMessage("Type cannot be empty", "error");
    return;
  }
  if (!text) {
    showMessage("Text cannot be empty", "error");
    return;
  }
  const id = modifyContainer.getAttribute("data-edit-id");
  if (id && id.length > 0) {
    updateConfig({ id, type, text });
  } else {
    addConfig({ type, text });
  }
}
function showAddForm() {
  const [modifyContainer, configViewContainer] = getConfigSubContainers();
  if (!modifyContainer || !configViewContainer) return;

  modifyContainer.style.display = "flex";
  configViewContainer.style.display = "none";
}
function showConfigView() {
  const [modifyContainer, configViewContainer] = getConfigSubContainers();
  if (!modifyContainer || !configViewContainer) return;

  modifyContainer.style.display = "none";
  configViewContainer.style.display = "block";
}
function addConfig({ type, text }) {
  const id = Date.now().toString();
  console.log("Adding config:", { id, type, text });
  showMessage("Config added successfully", "success");
}
function updateConfig({ id, type, text }) {
  console.log("Updating config:", { id, type, text });
  showMessage("Config updated successfully", "success");
}

function deleteConfig(id) {
  console.log("Delete config with id:", id);
}
function showMessage(message, type) {
  const errorText = document.getElementById("error-text");
  if (!errorText) return;
  if (errorTimeToClearId !== undefined) {
    clearTimeout(errorTimeToClearId);
  }
  errorText.textContent = message;
  if (type === "error") {
    errorText.style.color = "red";
  } else {
    errorText.style.color = "green";
  }
  errorTimeToClearId = setTimeout(() => {
    errorText.textContent = "";
    errorTimeToClearId = undefined;
  }, 5000);
}
function setup() {
  const [mainController, configController] = getTabControllers();
  if (mainController && configController) {
    mainController.addEventListener("click", () => {
      switchTab("main");
    });
    configController.addEventListener("click", () => {
      switchTab("config");
    });
  }
  const lastTab = getLastTab();
  switchTab(lastTab);
  const saveConfigButton = document.getElementById("save-config-button");
  const cancelConfigButton = document.getElementById("cancel-config-button");
  if (saveConfigButton) {
    saveConfigButton.addEventListener("click", saveConfig);
  }
  if (cancelConfigButton) {
    cancelConfigButton.addEventListener("click", showConfigView);
  }
  const addNewConfigButton = document.getElementById("add-new-config");
  if (addNewConfigButton) {
    addNewConfigButton.addEventListener("click", () => {
      const [modifyContainer] = getConfigSubContainers();
      if (!modifyContainer) return;

      modifyContainer.setAttribute("data-edit-id", "");
      modifyContainer.querySelector("select").value = "";
      modifyContainer.querySelector("input[name='config-text']").value = "";
      showAddForm();
    });
  }
  const hideCommentsButton = document.getElementById("hide-comments");
  if (hideCommentsButton) {
    hideCommentsButton.addEventListener("click", hideComments);
  }
}

document.addEventListener("DOMContentLoaded", setup);
