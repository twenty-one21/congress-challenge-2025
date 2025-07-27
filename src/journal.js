import { db } from "./firebase.js";
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const journalsRef = collection(db, "journals");

document.getElementById("journalForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  if (!title || !content) return;

  try {
    await addDoc(journalsRef, {
      title,
      content,
      createdAt: new Date()
    });
    console.log("Journal entry added!");
  } catch (err) {
    console.error("Error adding journal:", err);
    alert("Failed to add journal. Check the console.");
  } 

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
});