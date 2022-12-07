const lsKeyNotes = "notesapp-notes";

export default class Storage {

    static getAllNotes() {
        const notes = JSON.parse(localStorage.getItem(lsKeyNotes) || "[]");

        // Sort by last updated time.
        const sorted_notes = notes.sort((a, b) => {
            return new Date(a.lastUpdated) > new Date(b.lastUpdated) ? -1 : 1;
        });

        return sorted_notes;
    }

    static addNote() {
        const notes = this.getAllNotes();
        const newNote = {
            id: Math.floor(Math.random() * 1000000),
            body: "",
            lastUpdated: new Date().toISOString(),
        }
        notes.push(newNote);
        localStorage.setItem(lsKeyNotes, JSON.stringify(notes));
        return newNote.id;
    }

    static editNote(id, newBody) {
        const notes = this.getAllNotes();
        const existingNote = notes.find(saved_note => saved_note.id == id);
        existingNote.body = newBody;
        existingNote.lastUpdated = new Date().toISOString();
        localStorage.setItem(lsKeyNotes, JSON.stringify(notes));
    }

    static deleteNote(noteId) {
        const notes = this.getAllNotes();
        const notesAfterDeletion = notes.filter(note => note.id != noteId);
        localStorage.setItem(lsKeyNotes, JSON.stringify(notesAfterDeletion));
    }
}