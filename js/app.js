import Storage from "./storage.js";
import Search from "./search.js";
import View from "./view.js";
import Export from "./export.js";

export const NOT_SEARCHING = 0;
export const SEARCHING_BUT_IGNORED = 1;
export const SEARCHING = 2;

export default class App {
    constructor(rootEl) {
        this.notes = Storage.getAllNotes();
        this.isSearching = NOT_SEARCHING;
        this.searchText = null;
        this.searchResults = null; // Should be read only if `this.searchText` is `SEARCHING`.
        this.view = new View(rootEl, this.notes, this._handlers());
    }

    _handlers() {
        return {
            onNoteSelect: (noteId) => {
                this.view.updateActiveNote(this.notes.find(note => note.id == noteId), false);
            },
            onNoteAdd: () => {
                const idOfNewNote = Storage.addNote();
                this.notes = Storage.getAllNotes();
                if (this.isSearching == SEARCHING) {
                    this.calculateSearchResults();
                }
                this.view.updateNoteList(this.allModelNotesToViewNotes(), this.isSearching);
                this.view.updateActiveNote(this.notes.find(note => note.id == idOfNewNote), true);
            },
            onNoteDelete: (noteId) => {
                Storage.deleteNote(noteId);
                this.notes = Storage.getAllNotes();
                if (this.isSearching == SEARCHING) {
                    this.calculateSearchResults();
                }
                this.view.updateNoteList(this.allModelNotesToViewNotes(), this.isSearching);
            },
            onNoteEdit: (noteId, newBody) => {
                Storage.editNote(noteId, newBody);
                this.notes = Storage.getAllNotes();
                if (this.isSearching == SEARCHING) {
                    this.calculateSearchResults();
                }
                this.view.updateNoteList(this.allModelNotesToViewNotes(), this.isSearching);
            },
            onSearch: (searchText) => {
                this.searchText = searchText;
                if (searchText != "") {
                    if (Search.needleShouldBeIgnored(this.searchText)) {
                        this.isSearching = SEARCHING_BUT_IGNORED;
                    }
                    else {
                        this.isSearching = SEARCHING;
                        this.calculateSearchResults();
                    }
                }
                else {
                    this.isSearching = NOT_SEARCHING;
                }

                this.view.updateNoteList(this.allModelNotesToViewNotes(), this.isSearching);
            },
            onNoteExport: (noteId) => {
                const noteToExport = this.notes.find(note => note.id == noteId)
                const fileName = noteToExport.id + ".txt";
                const fileContent = noteToExport.body;
                Export.export(fileName, fileContent);
            },
        }
    }

    allModelNotesToViewNotes() {
        return this.notes.map((modelNote, i) => {
            var viewNote = {};
            viewNote.id = modelNote.id;
            viewNote.body = modelNote.body;
            viewNote.lastUpdated = modelNote.lastUpdated;
            if (this.isSearching == SEARCHING) {
                viewNote.searchResults = this.searchResults[i];
            }
            return viewNote;
        });
    }

    calculateSearchResults() {
        console.assert(this.isSearching == SEARCHING);

        this.searchResults = this.notes.map(note => {
            const searchResult = Search.search(this.searchText, note.body);
            return searchResult;
        });
    }
}