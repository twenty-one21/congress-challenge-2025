import { db, auth } from "./firebase.js";
import { 
  collection, addDoc, query, where, orderBy, getDocs 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const entryInput = document.getElementById("journal-entry");
const saveBtn = document.getElementById("save-entry");
const entriesList = document.getElementById("entries-list");

let currentUser;

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        await loadEntries();
    } else {
        entriesList.innerHTML = `<p>Please sign in to view your journal entries.</p>`;
    }
});

saveBtn.addEventListener("click", async () => {
    const text = entryInput.value.trim();
    if (!text) return alert("Please write something!");
    const date = new Date().toISOString();

    await addDoc(collection(db, "users", currentUser.uid, "entries"), {
        text,
        date
    });

    entryInput.value = "";
    await loadEntries();
});

// Load entries
async function loadEntries() {
    const q = query(collection(db, "users", currentUser.uid, "entries"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    entriesList.innerHTML = "";
    snapshot.forEach(doc => {
        const entry = doc.data();

        const card = document.createElement("div");
        card.className = "entry-card";
        card.innerHTML = `<strong>${new Date(entry.date).toLocaleDateString()}</strong><p>${entry.text}</p>`;
        entriesList.appendChild(card);
    });
}