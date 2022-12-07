import { NOT_SEARCHING, SEARCHING, SEARCHING_BUT_IGNORED } from "./app.js";
import Icons from "./icons.js";
import ScrollLine from "./ui/scroll_line.js";
import TextField from "./ui/text_field.js";

export default class View {
    constructor(rootEl, notes, { onNoteSelect, onNoteAdd, onNoteEdit, onNoteDelete, onSearch, onNoteExport } = {}) {
        this.rootEl = rootEl;
        this.onNoteSelect = onNoteSelect;
        this.onNoteAdd = onNoteAdd;
        this.onNoteEdit = onNoteEdit;
        this.onNoteDelete = onNoteDelete;
        this.onSearch = onSearch;
        this.onNoteExport = onNoteExport;

        this.activeNoteId = null;

        this.rootEl.innerHTML = `
            <div class="main_row">
                <div class="notes__left_col">
                    <div class="bar">
                        <div class="buttons_gap"></div>                   
                        <button class="notes__add" type="button">
                            <div class="button__icon">${Icons.compose()}</div>
                        </button>                       
                    </div>
                    <div class="horizontal_line"></div>
                    <div class="notes__list"></div>
                </div>
                <div class="notes__right_col">
                    <div class="bar notes__right_bar">
                        <button class="notes__delete" type="button">
                            <div class="button__icon">${Icons.bin()}</div>
                        </button>
                        <div class="buttons_gap"></div>
                        <button class="notes__export" type="button">
                            <div class="button__icon">${Icons.download()}</div>
                        </button>
                    </div>
                    <div class="horizontal_line"></div>
                    <div class="notes__right_col__body">
                        <div contenteditable=""true" role="textbox" class="notes__body">Body...</div>
                    </div>
                </div>
            </div>
        `;

        const btnAddNoteEl = this.rootEl.querySelector(".notes__add");
        const inpBodyEl = this.rootEl.querySelector(".notes__body");
        const btnExportNoteEl = this.rootEl.querySelector(".notes__export");
        const btnDeleteNoteEl = this.rootEl.querySelector(".notes__delete");

        btnAddNoteEl.addEventListener("click", () => this.onNoteAdd());
        inpBodyEl.addEventListener("focusout", () => {
            const updatedBody = inpBodyEl.textContent;
            this.onNoteEdit(this.activeNoteId, updatedBody);
        });
        btnExportNoteEl.addEventListener("click", () => this.onNoteExport(this.activeNoteId));
        btnDeleteNoteEl.addEventListener("click", () => {
            const doDelete = confirm("Are you sure you want to delete this note?");
            if (doDelete) {
                this.onNoteDelete(this.activeNoteId);
            }
        });

        // If use use 'enter' in a `contenteditable` the text text will be split in two.
        // The desired behaviour is to add a "\n" so it needs to manually changed.
        inpBodyEl.addEventListener("keydown", (e) => {
            const KEY_ENTER = 13;
            if (e.keyCode === KEY_ENTER) {
                e.stopPropagation();
                e.preventDefault();
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const newLine = document.createTextNode("\n");
                range.deleteContents();
                range.insertNode(newLine);
                range.setStartAfter(newLine);
                range.setEndAfter(newLine);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        const textFieldSearchEl = TextField.create("Search…", (value) => this.onSearch(value)).el;
        textFieldSearchEl.classList.add("notes__search");
        this.rootEl.querySelector(".notes__left_col .bar").prepend(textFieldSearchEl);

        const leftColDividerEl = this.rootEl.querySelector(".notes__left_col .horizontal_line");
        const leftColScrollableEl = this.rootEl.querySelector(".notes__list");
        ScrollLine.bind(leftColDividerEl, leftColScrollableEl);

        const rigthColDivider = this.rootEl.querySelector(".notes__right_col .horizontal_line");
        const rightColScrollableEl = this.rootEl.querySelector(".notes__right_col__body");
        ScrollLine.bind(rigthColDivider, rightColScrollableEl);

        this.updateNoteList(notes);
        this._updateNotePreviewVisibility(false);
    }

    static _createListItemHTML(id, body, lastUpdated, matchesSearch) {
        const notInSearchClass = matchesSearch ? "" : "notes__list-item--not_in_search";
        const nowSec = Math.floor((new Date()).getTime() / 1000);
        const lastUpdatedSec = Math.floor(lastUpdated.getTime() / 1000);
        return `
            <div class="notes__list-item ${notInSearchClass}" data-note-id="${id}">
                <div class="notes__list-item__body">${body}</div>
                <div class="notes__list-item__last-updated">
                    ${View._relativeTimeShort(lastUpdatedSec, nowSec)}
                </div>
            </div>
        `;
    }

    static _relativeTimeShort(timeSec, nowSec) {
        const differenceSec = nowSec - timeSec;
        var result;
        if (differenceSec < 60) {
            // Less than a minute has passed.
            result = "0m";
        }
        else if (differenceSec < 3600) {
            // Less than an hour has passed.
            result = `${Math.floor(differenceSec / 60)}m`;
        }
        else if (differenceSec < 86400) {
            // Less than a day has passed.
            result = `${Math.floor(differenceSec / 3600)}h`;
        }
        else if (differenceSec < 2620800) {
            // Less than a month has passed.
            result = `${Math.floor(differenceSec / 86400)}d`;
        }
        else if (differenceSec < 31449600) {
            // Less than a year has passed.
            result = `${Math.floor(differenceSec / 2620800)}m`;
        }
        else {
            // More than a year has passed.
            result = `${Math.floor(differenceSec / 31449600)}y`;
        }
        return result;
    }

    updateNoteList(notes, isSearching) {
        const noteListEl = this.rootEl.querySelector(".notes__list");

        // Clear.
        noteListEl.innerHTML = "";

        for (const note of notes) {
            const matchesSearch = isSearching != SEARCHING || (isSearching == SEARCHING && note.searchResults.length > 0);
            const html = View._createListItemHTML(note.id, note.body, new Date(note.lastUpdated), matchesSearch);
            noteListEl.insertAdjacentHTML("beforeend", html);
        }

        // Number of notes at the bottom of the list.
        if (notes.length >= 20) {
            var notesCountHTML;
            if (isSearching == NOT_SEARCHING) {
                notesCountHTML = `<div class="notes__list__count">${notes.length + " notes"}</div>`;
            }
            else if (isSearching == SEARCHING_BUT_IGNORED) {
                notesCountHTML = `<div class="notes__list__count">${notes.length + " of " + notes.length + " notes"}</div>`;
            }
            else {
                var resultCount = 0;
                notes.forEach(note => {
                    if (note.searchResults.length > 0) {
                        resultCount++;
                    }
                });
                notesCountHTML = `<div class="notes__list__count">${resultCount + " of " + notes.length + " notes"}</div>`;
            }
            noteListEl.insertAdjacentHTML("beforeend", notesCountHTML);
        }

        noteListEl.querySelectorAll(".notes__list-item").forEach(noteListItem => {
            const noteId = noteListItem.dataset.noteId;
            noteListItem.addEventListener("click", () => this.onNoteSelect(noteId));
        });

        // Handle currently selected note.
        if (this.activeNoteId != null) {
            const activeNote = notes.find(note => note.id == this.activeNoteId);
            if (activeNote) {
                this.updateActiveNote(activeNote, false);
            }
            else {
                this.activeNoteId = null;
                this._updateNotePreviewVisibility(false);
            }
        }
    }

    updateActiveNote(note, focusTextArea) {
        this.activeNoteId = note.id;
        this.rootEl.querySelector(".notes__body").textContent = note.body;
        this.rootEl.querySelectorAll(".notes__list-item").forEach(noteListItem => {
            noteListItem.classList.remove("notes__list-item--selected");
        });
        this.rootEl.querySelector(`.notes__list-item[data-note-id="${note.id}"]`).classList.add("notes__list-item--selected");
        this._updateNotePreviewVisibility(true);
        if (focusTextArea) {
            this.rootEl.querySelector(".notes__body").focus();
        }
    }

    _updateNotePreviewVisibility(isVisible) {
        this.rootEl.querySelector(".notes__body").style.visibility = isVisible ? "visible" : "hidden";
        this.rootEl.querySelector(".notes__delete").style.visibility = isVisible ? "visible" : "hidden";
        this.rootEl.querySelector(".notes__export").style.visibility = isVisible ? "visible" : "hidden";
    }
}