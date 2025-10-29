import { db, auth } from "./firebase.js";
import { 
  collection, addDoc, query, orderBy, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const entryInput = document.getElementById("journal-entry");
const saveBtn = document.getElementById("save-entry");
const entriesList = document.getElementById("entries-list");

let currentUser;

// Wait for auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        await loadEntries();
    } else {
        entriesList.innerHTML = `<p style="text-align: center; color: #666;">Please sign in to view your journal entries.</p>`;
        saveBtn.disabled = true;
    }
});

// Save entry
saveBtn.addEventListener("click", async () => {
    if (!currentUser) {
        alert("Please sign in first!");
        return;
    }

    const text = entryInput.value.trim();
    if (!text) {
        alert("Please write something!");
        return;
    }

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        await addDoc(collection(db, "users", currentUser.uid, "entries"), {
            text,
            date: new Date().toISOString()
        });

        entryInput.value = "";
        await loadEntries();
        
        saveBtn.textContent = "Save Entry";
        saveBtn.disabled = false;
    } catch (error) {
        console.error("Error saving entry:", error);
        alert("Failed to save entry. Please try again.");
        saveBtn.textContent = "Save Entry";
        saveBtn.disabled = false;
    }
});

// Load entries
async function loadEntries() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "users", currentUser.uid, "entries"), 
            orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            entriesList.innerHTML = `<p style="text-align: center; color: #666;">No entries yet. Start journaling!</p>`;
            return;
        }

        entriesList.innerHTML = "";
        snapshot.forEach(docSnap => {
            const entry = docSnap.data();
            const entryDate = new Date(entry.date);

            const card = document.createElement("div");
            card.className = "entry-card";
            card.innerHTML = `
                <div class="entry-header">
                    <strong>${entryDate.toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                    })}</strong>
                    <span class="entry-time">${entryDate.toLocaleTimeString("en-US", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                    })}</span>
                </div>
                <p class="entry-text">${entry.text}</p>
                <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
            `;
            
            // Add delete functionality
            card.querySelector(".delete-btn").addEventListener("click", async (e) => {
                if (confirm("Are you sure you want to delete this entry?")) {
                    try {
                        await deleteDoc(doc(db, "users", currentUser.uid, "entries", docSnap.id));
                        await loadEntries();
                    } catch (error) {
                        console.error("Error deleting entry:", error);
                        alert("Failed to delete entry.");
                    }
                }
            });

            entriesList.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading entries:", error);
        entriesList.innerHTML = `<p style="color: red;">Error loading entries. Please refresh the page.</p>`;
    }
}