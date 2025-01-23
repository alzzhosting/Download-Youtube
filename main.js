async function ytdl(link, qualityIndex, typeIndex) {
    const qualities = {
        audio: { 1: '64', 2: '128', 3: '192' },
        video: { 1: '480', 2: '720', 3: '1440' }
    };
    const headers = {
        accept: '*/*',
        referer: 'https://ytshorts.savetube.me/',
        origin: 'https://ytshorts.savetube.me/',
        'user-agent': 'Postify/1.0.0',
        'Content-Type': 'application/json'
    };
    const cdn = () => Math.floor(Math.random() * 11) + 51;
    const type = typeIndex === 1 ? 'audio' : 'video';
    const quality = qualities[type][qualityIndex];
    const cdnNumber = cdn();
    const cdnUrl = `cdn${cdnNumber}.savetube.su`;
    const videoInfoResponse = await axios.post(
        `https://${cdnUrl}/info`, { url: link }, { headers: { ...headers, authority: `cdn${cdnNumber}.savetube.su` } });
    const videoInfo = videoInfoResponse.data.data;
    const body = {
        downloadType: type,
        quality,
        key: videoInfo.key
    };
    const downloadResponse = await axios.post(
        `https://${cdnUrl}/download`,
        body,
        { headers: { ...headers, authority: `cdn${cdnNumber}.savetube.su` } }
    );
    const downloadData = downloadResponse.data.data;
    return {
        link: downloadData.downloadUrl,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        type
    };
}

function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`;
    notification.classList.remove("hidden");
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 4000);
}

document.getElementById("download-btn").addEventListener("click", async () => {
    const url = document.getElementById("youtube-url").value;
    const downloadType = parseInt(document.getElementById("download-type").value);
    const quality = parseInt(document.getElementById("quality").value);
    if (!url) {
        showNotification("Masukin URL yang bener ya!", "error");
        return;
    }
    const loading = document.getElementById("loading");
    const downloadResult = document.getElementById("download-result");
    const thumbnail = document.getElementById("thumbnail");
    const downloadTitle = document.getElementById("download-title");
    const mediaContainer = document.getElementById("media-container");
    const downloadLink = document.getElementById("download-link");
    const mediaLabel = document.getElementById("media-label");
    loading.classList.remove("hidden");
    downloadResult.classList.add("hidden");
    mediaContainer.innerHTML = "";
    try {
        const downloadInfo = await ytdl(url, quality, downloadType);
        loading.classList.add("hidden");
        downloadResult.classList.remove("hidden");
        thumbnail.src = downloadInfo.thumbnail;
        downloadTitle.textContent = downloadInfo.title;
        downloadLink.href = downloadInfo.link;
        if (downloadInfo.type === "audio") {
            mediaLabel.textContent = "Audio";
            const audio = document.createElement("audio");
            audio.controls = true;
            audio.src = downloadInfo.link;
            audio.classList.add("w-full", "rounded-lg", "bg-gray-200", "p-2");
            mediaContainer.appendChild(audio);
        } else {
            mediaLabel.textContent = "Video";
            const video = document.createElement("video");
            video.controls = true;
            video.src = downloadInfo.link;
            video.classList.add("w-full", "rounded-lg", "border-2", "border-black", "bg-black");
            mediaContainer.appendChild(video);
        }
    } catch (error) {
        showNotification("Yah, coba lagi nanti ya!", "error");
        loading.classList.add("hidden");
    }
});