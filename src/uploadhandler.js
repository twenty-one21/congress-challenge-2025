document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch('/upload', { //something wrong with this line
    method: 'POST',
    body: formData,
    });

    if (res.ok) {
    alert('Upload successful!');
    loadVideos();
    } else {
    alert('Upload failed');
    }
});

async function loadVideos() {
    const res = await fetch('/videos'); // something wrong with this line
    const videos = await res.json();
    const list = document.getElementById('videoList');
    list.innerHTML = '';

    videos.forEach(video => {
    const li = document.createElement('li');
    li.textContent = video.filename + ' ';
    const a = document.createElement('a');
    a.href = `/download/${video.filename}`;
    a.textContent = 'Download';
    a.download = video.filename;
    li.appendChild(a);
    list.appendChild(li);
    });
}

loadVideos();