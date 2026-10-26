// Stores notes and tracks the selected note and section.
let notes = [];
let currentNoteId = null;
let currentSection = "all";


/* LOAD NOTES */

// Loads saved notes or creates sample notes if none exist.
function loadNotes() {
    const savedNotes = localStorage.getItem("notesClone");

    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    } else {
        notes = [
            {
                id: 1,
                title: "Welcome to Notes",
                content:
                    "This is your first note. You can edit, pin, favorite, or delete it.",
                pinned: true,
                favorite: false,
                deleted: false,
                date: "Oct 07, 2026 14:15"
            },
            {
                id: 2,
                title: "School Tasks",
                content:
                    "Finish the MCO1 project and prepare for the presentation.",
                pinned: false,
                favorite: false,
                deleted: false,
                date: "Oct 07, 2026 14:15"
            },
            {
                id: 3,
                title: "Shopping List",
                content:
                    "Notebook\nBallpen\nFolder",
                pinned: false,
                favorite: false,
                deleted: false,
                date: "Oct 07, 2026 14:15"
            }
        ];

        saveToStorage();
    }

    displayNotes();
}


/* SAVE NOTES */

// Saves the notes array in the browser's localStorage.
function saveToStorage() {
    localStorage.setItem(
        "notesClone",
        JSON.stringify(notes)
    );
}


/* DISPLAY NOTES */

// Filters and displays notes based on the selected section.
function displayNotes() {

    const container =
        document.getElementById("notesContainer");

    container.innerHTML = "";

    let visibleNotes = notes.filter(note => {

        // Show only deleted notes in Trash.
        if (currentSection === "trash") {
            return note.deleted === true;
        }

        // Hide deleted notes from other sections.
        if (note.deleted === true) {
            return false;
        }

        // Show only pinned notes.
        if (currentSection === "pinned") {
            return note.pinned === true;
        }

        // Show only favorite notes.
        if (currentSection === "favorites") {
            return note.favorite === true;
        }

        if (currentSection === "custom") {
            return note.custom === true;
        }

        return true;
    });


    /* SEARCH */

    // Filters notes by title or content.
    const searchInput =
        document.getElementById("searchInput");

    const searchText =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    if (searchText !== "") {

        visibleNotes = visibleNotes.filter(note =>

            note.title
                .toLowerCase()
                .includes(searchText)

            ||

            note.content
                .toLowerCase()
                .includes(searchText)
        );
    }


    /* NOTE COUNT */

    // Displays the number of visible notes.
    const noteCount =
        document.getElementById("noteCount");

    if (noteCount) {

        noteCount.textContent =
            `${visibleNotes.length} ${
                visibleNotes.length === 1
                    ? "note"
                    : "notes"
            }`;
    }


    /* EMPTY STATE */

    // Shows a message when no notes match the selected section or search.
    if (visibleNotes.length === 0) {

        container.innerHTML = `
            <div class="empty">
                📝
                <br><br>
                No notes here yet.
            </div>
        `;

        return;
    }


    /* CREATE NOTE CARDS */

    // Creates a card for each visible note.
    visibleNotes.forEach(note => {

        const card =
            document.createElement("div");

        card.className =
            "note" +
            (note.pinned ? " pinned" : "");


        /* NORMAL NOTES */

        if (!note.deleted) {

            // Opens the selected note for editing.
            card.addEventListener(
                "click",
                () => openEditNote(note.id)
            );

            const pin =
                note.pinned ? "📌" : "";

            const favorite =
                note.favorite ? "⭐" : "";

            const custom =
                note.custom ? "📋" : "";

            // Displays the note's title, content, and date.
            card.innerHTML = `

                <div class="note-icons">
                    ${pin} ${favorite}
                </div>

                <h3>
                    ${escapeHtml(note.title)}
                </h3>

                <p>
                    ${escapeHtml(note.content)}
                </p>

                <div class="note-date">
                    ${escapeHtml(note.date)}
                </div>

            `;
        }


        /* TRASH NOTES */

        else {

            // Displays deleted notes with Restore and Delete Forever options.
            card.innerHTML = `

                <div class="note-icons">
                    🗑️
                </div>

                <h3>
                    ${escapeHtml(note.title)}
                </h3>

                <p>
                    ${escapeHtml(note.content)}
                </p>

                <div class="note-date">
                    ${escapeHtml(note.date)}
                </div>

                <div class="trash-actions">

                    <button
                        class="restore-btn"
                        data-id="${note.id}">
                        Restore
                    </button>

                    <button
                        class="permanent-delete-btn"
                        data-id="${note.id}">
                        Delete Forever
                    </button>

                </div>

            `;
        }

        // Adds the note card to the page.
        container.appendChild(card);
    });


    /* TRASH BUTTON EVENTS */

    // Connects Restore buttons to the restore function.
    document
        .querySelectorAll(".restore-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const id =
                        Number(button.dataset.id);

                    restoreNote(id);
                }
            );
        });

    // Connects Delete Forever buttons to permanent deletion.
    document
        .querySelectorAll(".permanent-delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const id =
                        Number(button.dataset.id);

                    permanentlyDeleteNote(id);
                }
            );
        });
}


/* OPEN NEW NOTE */

// Opens a blank form for creating a new note.
function openNewNote() {

    currentNoteId = null;

    document.getElementById("modalTitle")
        .textContent = "New Note";

    document.getElementById("titleInput")
        .value = "";

    document.getElementById("contentInput")
        .value = "";

    document.getElementById("pinnedInput")
        .checked = false;

    document.getElementById("favoriteInput")
        .checked = false;

    document.getElementById("deleteBtn")
        .style.display = "none";

    document.getElementById("noteModal")
        .classList.add("show");

    document.getElementById("titleInput")
        .focus();
}


/* OPEN EDIT NOTE */

// Loads an existing note into the editor.
function openEditNote(id) {

    const note =
        notes.find(note => note.id === id);

    if (!note) {
        return;
    }

    // Prevent deleted notes from being edited.
    if (note.deleted) {
        return;
    }

    currentNoteId = id;

    document.getElementById("modalTitle")
        .textContent = "Edit Note";

    document.getElementById("titleInput")
        .value = note.title;

    document.getElementById("contentInput")
        .value = note.content;

    document.getElementById("pinnedInput")
        .checked = note.pinned;

    document.getElementById("favoriteInput")
        .checked = note.favorite;

     document.getElementById("customInput")
        .checked = note.custom;

    document.getElementById("deleteBtn")
        .style.display = "block";

    document.getElementById("noteModal")
        .classList.add("show");
}


/* SAVE NOTE */

// Creates a new note or updates an existing note.
function saveNote() {

    const title =
        document.getElementById("titleInput")
            .value.trim();

    const content =
        document.getElementById("contentInput")
            .value.trim();

    const pinned =
        document.getElementById("pinnedInput")
            .checked;

    const favorite =
        document.getElementById("favoriteInput")
            .checked;
            
     const custom =
        document.getElementById("customInput")
            .checked;

    // Prevents saving when both title and content are empty.
    if (!title && !content) {

        alert(
            "Please enter a title or note."
        );

        return;
    }


    const date =
        new Date().toLocaleString();


    /* CREATE NEW NOTE */

    if (currentNoteId === null) {

        const newNote = {

            id: Date.now(),

            title:
                title || "Untitled",

            content:
                content,

            pinned:
                pinned,

            favorite:
                favorite,

            deleted:
                false,

            date:
                date
        };

        // Adds the new note to the beginning of the array.
        notes.unshift(newNote);
    }


    /* EDIT EXISTING NOTE */

    else {

        const note =
            notes.find(
                note => note.id === currentNoteId
            );

        if (note) {

            note.title =
                title || "Untitled";

            note.content =
                content;

            note.pinned =
                pinned;

            note.favorite =
                favorite;

            note.custom =
                custom;

            note.date =
                date;

            // Ensures the edited note is not in the Trash.
            note.deleted = false;
        }
    }

    // Saves changes, closes the editor, and refreshes the display.
    saveToStorage();
    closeModal();
    displayNotes();
}


/* DELETE NOTE TO TRASH */

// Moves a note to the Trash without permanently deleting it.
function deleteCurrentNote() {

    if (currentNoteId === null) {
        return;
    }

    const note =
        notes.find(
            note => note.id === currentNoteId
        );

    if (note) {

        note.deleted = true;

        // Removes the note from Pinned and Favorites.
        note.pinned = false;
        note.favorite = false;
        note.custom = false;

        saveToStorage();
    }

    closeModal();
    displayNotes();
}


/* RESTORE NOTE */

// Moves a note from the Trash back to the normal notes.
function restoreNote(id) {

    const note =
        notes.find(
            note => note.id === id
        );

    if (!note) {
        return;
    }

    note.deleted = false;

    saveToStorage();
    displayNotes();
}


/* PERMANENT DELETE */

// Permanently removes a note after user confirmation.
function permanentlyDeleteNote(id) {

    const confirmed =
        confirm(
            "Permanently delete this note?"
        );

    if (!confirmed) {
        return;
    }

    // Keeps every note except the one being deleted.
    notes =
        notes.filter(
            note => note.id !== id
        );

    saveToStorage();
    displayNotes();
}


/* CHANGE SECTION */

// Switches between All Notes, Pinned, Favorites, and Trash.
function changeSection(section) {

    currentSection = section;


    /* ACTIVE SIDEBAR BUTTON */

    // Removes the active style from all sidebar buttons.
    document
        .querySelectorAll(".menu-btn")
        .forEach(button => {

            button.classList.remove("active");
        });

    const activeButton =
        document.querySelector(
            `[data-section="${section}"]`
        );

    // Highlights the selected sidebar button.
    if (activeButton) {
        activeButton.classList.add("active");
    }


    /* SECTION TITLES */

    const titles = {
        all: "All Notes",
        pinned: "Pinned Notes",
        favorites: "Favorite Notes",
        trash: "Trash",
        custom: "Custom Notes"
    };

    const sectionTitle =
        document.getElementById("sectionTitle");

    if (sectionTitle) {
        sectionTitle.textContent =
            titles[section];
    }

    displayNotes();
}


/* SEARCH */

// Refreshes the displayed notes when the search input changes.
function searchNotes() {
    displayNotes();
}


/* CLOSE MODAL */

// Hides the note editor.
function closeModal() {
    document
        .getElementById("noteModal")
        .classList.remove("show");
}


/* ESCAPE HTML */

// Helps prevent note text from being interpreted as HTML markup.
function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


/* BUTTON EVENTS */

// Connects the main buttons to their corresponding functions.
document
    .getElementById("newNoteBtn")
    .addEventListener(
        "click",
        openNewNote
    );

document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        saveNote
    );

document
    .getElementById("deleteBtn")
    .addEventListener(
        "click",
        deleteCurrentNote
    );

document
    .getElementById("closeBtn")
    .addEventListener(
        "click",
        closeModal
    );

document
    .getElementById("cancelBtn")
    .addEventListener(
        "click",
        closeModal
    );


/* SEARCH INPUT */

// Runs the search function whenever the user types.
document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        searchNotes
    );


/* SIDEBAR */

// Connects each sidebar button to its corresponding section.
document
    .querySelectorAll(".menu-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                changeSection(
                    button.dataset.section
                );
            }
        );
    });


/* CLOSE MODAL OUTSIDE */

// Closes the editor when the user clicks its background.
document
    .getElementById("noteModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id === "noteModal"
            ) {
                closeModal();
            }
        }
    );


/* ESC KEY */

// Closes the editor when the Escape key is pressed.
document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeModal();
        }
    }
);


/* START APPLICATION */

// Loads saved notes and displays them when the app starts.
loadNotes();