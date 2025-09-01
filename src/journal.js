import { db, auth } from "./firebase.js";
import { 
  collection, addDoc, query, where, orderBy, getDocs 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const journalsRef = collection(db, "journals");
const journalList = document.getElementById("journalList");
const form = document.getElementById("journalForm");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadJournals(user.uid);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();
      if (!title || !content) return;

      try {
        await addDoc(journalsRef, {
          uid: user.uid,
          title,
          content,
          createdAt: new Date()
        });
        form.reset();
        loadJournals(user.uid);
      } catch (err) {
        console.error("Error adding journal:", err);
        alert("Failed to add journal. Check console.");
      }
    });
  } else {
    journalList.innerHTML = "<li>Please sign in to view your journals.</li>";
  }
});

async function loadJournals(uid) {
  journalList.innerHTML = "";
  const q = query(journalsRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    journalList.innerHTML = "<li>No journals yet.</li>";
    return;
  }

  querySnapshot.forEach((journalDoc) => {
    const data = journalDoc.data();
    const journalId = journalDoc.id;

    // Format the Firestore Timestamp → readable date
    const date = data.createdAt?.toDate 
      ? data.createdAt.toDate().toLocaleString() 
      : "Unknown date";

    // Create styled card
    const li = document.createElement("li");
    li.className = "journal-entry";

    li.innerHTML = `
      <div class="journal-header">
        <h3 class="journal-title">${data.title}</h3>
        <span class="journal-date">${date}</span>
      </div>
      <p class="journal-content">${data.content}</p>
      <div class="journal-actions">
        <button class="edit-btn">✏️ Edit</button>
        <button class="delete-btn">🗑 Delete</button>
      </div>
    `;

    const deleteBtn = li.querySelector(".delete-btn");
    const editBtn = li.querySelector(".edit-btn");
    const contentEl = li.querySelector(".journal-content");
    const titleEl = li.querySelector(".journal-title");

    // Delete button
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this journal?")) {
        try {
          await deleteDoc(doc(db, "journals", journalId));
          li.remove();
        } catch (err) {
          console.error("Error deleting journal:", err);
          alert("Failed to delete journal.");
        }
      }
    });

    // Edit button
    editBtn.addEventListener("click", () => {
      // Replace content/title with inputs
      const titleInput = document.createElement("input");
      titleInput.value = titleEl.textContent;
      titleInput.className = "edit-input";

      const contentInput = document.createElement("textarea");
      contentInput.value = contentEl.textContent;
      contentInput.className = "edit-textarea";

      titleEl.replaceWith(titleInput);
      contentEl.replaceWith(contentInput);

      // Change buttons
      editBtn.style.display = "none";
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "💾 Save";
      saveBtn.className = "save-btn";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "❌ Cancel";
      cancelBtn.className = "cancel-btn";

      li.querySelector(".journal-actions").prepend(cancelBtn);
      li.querySelector(".journal-actions").prepend(saveBtn);

      // Save handler
      saveBtn.addEventListener("click", async () => {
        const newTitle = titleInput.value.trim();
        const newContent = contentInput.value.trim();
        if (!newTitle || !newContent) {
          alert("Title and content cannot be empty.");
          return;
        }

        try {
          await updateDoc(doc(db, "journals", journalId), {
            title: newTitle,
            content: newContent
          });

          // Update UI
          const newTitleEl = document.createElement("h3");
          newTitleEl.className = "journal-title";
          newTitleEl.textContent = newTitle;

          const newContentEl = document.createElement("p");
          newContentEl.className = "journal-content";
          newContentEl.textContent = newContent;

          titleInput.replaceWith(newTitleEl);
          contentInput.replaceWith(newContentEl);

          saveBtn.remove();
          cancelBtn.remove();
          editBtn.style.display = "inline-block";
        } catch (err) {
          console.error("Error updating journal:", err);
          alert("Failed to update journal.");
        }
      });

      // Cancel handler
      cancelBtn.addEventListener("click", () => {
        titleInput.replaceWith(titleEl);
        contentInput.replaceWith(contentEl);
        saveBtn.remove();
        cancelBtn.remove();
        editBtn.style.display = "inline-block";
      });
    });
    
    journalList.appendChild(li);
  });
}
