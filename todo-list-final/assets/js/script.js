//'https://jsonplaceholder.typicode.com/todos'

// Récupère l’élément input où on tape la tâche
const input = document.getElementById("new-todo");

// Récupère le bouton pour ajouter une nouvelle tâche
const btn = document.getElementById("add-todo");

// Récupère le conteneur où s’affichent toutes les tâches
const todoContainer = document.getElementById("todo-list");


// Initialise un tableau vide pour stocker les todos
let Arraytodo = [];

// Compteur pour donner un identifiant unique à chaque tâche
let numId = 0;

// Quand la page charge
window.onload = () => {
  // Récupère les todos stockés dans le localStorage ou un tableau vide
  const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

  // Pour chaque todo enregistré, on l’affiche à l’écran
  savedTodos.forEach((todo) => {
    displayTodo(todo); // on envoie le todo à afficher
  });

  // Ajoute les événements sur les icônes (modifier, copier, supprimer)
  addEventListenersToIcons();
};

// Fonction pour afficher une tâche (soit une nouvelle, soit une déjà existante)
const displayTodo = (todo = null) => {
  // Récupère la valeur à afficher : soit celle de l’objet todo, soit celle tapée dans le input
  const value = todo ? todo.title : input.value;

  // Ajoute le HTML d’une tâche dans le conteneur
  todoContainer.innerHTML += `
    <div class="listContainer" draggable="true">
        <li>
            <img src="./assets/img/add.png" alt="listIcon">
            <input type="text" class="inputTodo" value="${value}" id=${numId++}>
        </li>
        <div class="icons">
            <img src="./assets/img/pencil.png" alt="editIcon" class="edit">
            <img src="./assets/img/copy.png" alt="copyIcon" class="copied">
            <img src="./assets/img/trash.png" alt="deleteIcon" class="delete">
        </div>
    </div>
  `;

  // Si c’est un nouveau todo, on le sauvegarde dans l’API et localStorage
  if (!todo) {
    const newTodo = {
      title: input.value,
      completed: false,
      userId: 1,
    };

    // Envoie la tâche à l’API
    sendTodoToAPI(newTodo);

    // Ajoute la tâche dans le tableau temporaire
    Arraytodo.push(value);

    // Réinitialise le champ de saisie
    input.value = "";
  }

  // Ajoute les événements sur les nouvelles icônes
  addEventListenersToIcons();
  // Drag and Drop
  addDragAndDropListerner();
};

// Fonction pour ajouter les événements aux icônes de chaque tâche
const addEventListenersToIcons = () => {
  // Sélectionne tous les boutons "Supprimer"
  const deleteBtn = document.querySelectorAll(".delete");

  // Sélectionne tous les boutons "Copier"
  const copiedBtn = document.querySelectorAll(".copied");

  // Sélectionne tous les boutons "Modifier"
  const editBtn = document.querySelectorAll(".edit");

  // Sélectionne tous les champs de texte des tâches
  const inputTodos = document.querySelectorAll(".inputTodo");

  // Rends tous les champs de texte non modifiables
  inputTodos.forEach((inputTodo) => inputTodo.readOnly = true);

  // Pour chaque bouton "Modifier"
  editBtn.forEach((edBtn) => {
    edBtn.addEventListener("click", () => {
      // Récupère le conteneur de la tâche concernée
      const listContainer = edBtn.closest(".listContainer");

      // Récupère le champ de texte à modifier
      const textEdit = listContainer.querySelector(".inputTodo");

      // Récupère le conteneur des icônes
      const iconCont = listContainer.querySelector(".icons");

      // Rend le champ de texte modifiable
      textEdit.readOnly = false;

      // Met le curseur dedans
      textEdit.focus();

      // Si le bouton "Ajouter" n’a pas encore été ajouté
      if (!iconCont.querySelector(".btnEdit")) {
        // Crée un bouton "Ajouter"
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Ajouter";
        btnEdit.classList.add("btnEdit");

        // L’ajoute à la zone des icônes
        iconCont.appendChild(btnEdit);

        // Quand on clique sur "Ajouter"
        btnEdit.addEventListener("click", () => {
          // Rends le champ à nouveau non modifiable
          textEdit.readOnly = true;

          // Récupère les todos sauvegardés
          let savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

          // Récupère l’ID de la tâche modifiée
          const todoId = parseInt(textEdit.id);

          // Met à jour le titre dans le tableau local
          if (savedTodos[todoId]) {
            savedTodos[todoId].title = textEdit.value;
          }

          // Sauvegarde dans le localStorage
          localStorage.setItem("todos", JSON.stringify(savedTodos));

          // Supprime le bouton "Ajouter"
          btnEdit.remove();

          alert("Todo modifié !");
        });
      }
    });
  });

  // Pour chaque bouton "Supprimer"
  deleteBtn.forEach((delBtn) => {
    delBtn.addEventListener("click", () => {
      // Récupère le conteneur de la tâche
      const listContainer = delBtn.closest(".listContainer");

      // Récupère le texte de la tâche
      const inputTodo = listContainer.querySelector("input");
      const valueToDelete = inputTodo.value;

      // Confirmation avant de supprimer
      const confirmDelete = confirm(`Supprimer la tâche : "${valueToDelete}" ?`);
      if (!confirmDelete) return;

      // Supprime du DOM
      listContainer.remove();

      // Supprime du localStorage
      const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
      const updatedTodos = savedTodos.filter(todo => todo.title !== valueToDelete);

      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      console.log(`Todo supprimé : ${valueToDelete}`);
    });
  });

  // Pour chaque bouton "Copier"
  copiedBtn.forEach((copBtn) => {
    copBtn.addEventListener("click", () => {
      // Récupère le texte à copier
      const textCopy = copBtn.closest(".listContainer").querySelector("input").value;

      // Copie dans le presse-papiers
      navigator.clipboard.writeText(textCopy).then(() => {
        alert("Texte copié !");
      });
    });
  });
};

let draggedItem = null;
const addDragAndDropListerner = ()=>{
  const items = document.querySelectorAll('.listContainer');
  items.forEach((item)=>{
    item.addEventListener('dragstart', ()=>{
      draggedItem = item;
      setTimeout(()=>{
        item.style.display = 'none';
      }, 0);
    })
    item.addEventListener('dragend', ()=>{
      setTimeout(()=>{
        item.style.display = 'flex';
        draggedItem = null;
      }, 0);
    })
    item.addEventListener('dragover', (e)=>{
      e.preventDefault();
    })
    item.addEventListener('dragenter', (e)=>{
      e.preventDefault();
    })
    item.addEventListener('dragleave', (e)=>{
      e.preventDefault();
    })
    item.addEventListener('drop', function(e){
      e.preventDefault();
      if (this !== draggedItem) {
        this.parentNode.insertBefore(draggedItem, this);
      }
    });
  });
}

// Fonction pour envoyer la tâche à une API simulée
const sendTodoToAPI = (todo) => {
  fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST", // méthode d’envoi
    headers: { "Content-Type": "application/json" }, // indique que le format est JSON
    body: JSON.stringify(todo), // transforme l’objet en chaîne JSON
  })
    .then((res) => res.json()) // transforme la réponse en objet JS
    .then((data) => {
      // Récupère les todos existants
      const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

      // Ajoute le nouveau todo
      savedTodos.push(data);

      // Sauvegarde dans le localStorage
      localStorage.setItem("todos", JSON.stringify(savedTodos));

      console.log("Todo enregistré :", data);
    })
    .catch((err) => {
      // Affiche une erreur s’il y a un souci
      console.error("Erreur lors de l'envoi :", err);
    });
};

// Quand on clique sur le bouton d’ajout
btn.addEventListener("click", (e) => {
  e.preventDefault(); // empêche le rechargement de la page

  // Si le champ est vide
  if (!input.value) {
    console.log("inserer un message");
    alert("Inserer une liste");
  } else {
    // Sinon, on affiche la nouvelle tâche
    displayTodo();
  }
});
