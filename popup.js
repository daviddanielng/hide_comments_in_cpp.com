const configKey = "config";
function loadStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}
function saveStorage(key, value) {
  return new Promise((resolve) => {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

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
    saveStorage("lastTab", tab);
  }
}

function buildConfigUI() {
  const container = document.getElementById("config-list");
  if (!container) return;
  const html = [];
  loadStorage(configKey).then((data) => {
    const config = data || [];
    if (config.length === 0) {
      container.innerHTML =
        "<li style='padding: 10px;'>No configurations found.</li>";
      return;
    }

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

    container
      .querySelectorAll('button[data-action="edit"]')
      .forEach((button) => {
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
// ...existing code...
async function hideComments() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      showMessage("No active tab found", "error");
      return;
    }
    if (tab.url && !tab.url.includes("learncpp.com")) {
      showMessage("This extension only works on learncpp.com", "error");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (error) {
    console.error("Error hiding comments:", error);
    showMessage("Error: " + error.message, "error");
  }
}
async function unHideComments() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      showMessage("No active tab found", "error");
      return;
    }
    if (tab.url && !tab.url.includes("learncpp.com")) {
      showMessage("This extension only works on learncpp.com", "error");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["unhide.js"],
    });
  } catch (error) {
    console.error("Error showing comments:", error);
    showMessage("Error: " + error.message, "error");
  }
}
// ...existing code...
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
  loadStorage(configKey).then((data) => {
    const configs = data || [];
    const id = Date.now().toString();
    configs.push({ id, type, text });
    saveStorage(configKey, configs).then(() => {
      console.log("Config added:", { id, type, text });
      showMessage("Config added successfully", "success");
      buildConfigUI();
      showConfigView();
    });
  });
}
function updateConfig({ id, type, text }) {
  loadStorage(configKey).then((data) => {
    const configs = data || [];
    const index = configs.findIndex((cfg) => cfg.id === id);
    if (index === -1) {
      showMessage("Config not found for update", "error");
      return;
    }
    configs[index] = { id, type, text };
    saveStorage(configKey, configs).then(() => {
      console.log("Config updated:", { id, type, text });
      showMessage("Config updated successfully", "success");
      buildConfigUI();
      showConfigView();
    });
  });
}

function deleteConfig(id) {
  loadStorage(configKey).then((data) => {
    const configs = data || [];
    const index = configs.findIndex((cfg) => cfg.id === id);
    if (index === -1) {
      showMessage("Config not found for deletion", "error");
      return;
    }
    configs.splice(index, 1);
    saveStorage(configKey, configs).then(() => {
      console.log("Config deleted with id:", id);
      showMessage("Config deleted successfully", "success");
      buildConfigUI();
    });
  });
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
  } else if (type === "success") {
    errorText.style.color = "green";
  } else if (type === "info") {
    errorText.style.color = "black";
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
  loadStorage("lastTab").then((lastTab) => {
    switchTab(lastTab || "main");
  });
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
  const unhideCommentsButton = document.getElementById("unhide-comments");
  if (unhideCommentsButton) {
    unhideCommentsButton.addEventListener("click", unHideComments);
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "error") {
      showMessage(message.data, "error");
      // Update your popup UI here
    } else if (message.type === "success") {
      showMessage(message.data, "success");
    } else if (message.type === "info") {
      showMessage(message.data, "info");
    }
  });
  const toggleBackgroundCheckbox = document.getElementById("toggle-background");
  if (toggleBackgroundCheckbox) {
    toggleBackgroundCheckbox.addEventListener("change", () => {
      const enabled = toggleBackgroundCheckbox.checked;
      saveStorage("autoHideComments", enabled);
    });
    // Load initial state
    loadStorage("autoHideComments").then((enabled) => {
      toggleBackgroundCheckbox.checked = !!enabled;
    });
  }
}

document.addEventListener("DOMContentLoaded", setup);
