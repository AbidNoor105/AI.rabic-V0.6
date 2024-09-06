function fetchAyah() {
    const surahNumber = document.getElementById("surahInput").value;
    const ayahNumber = document.getElementById("ayahInput").value;
    const urlArabic = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.asad`;
    const urlEnglish = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.asad`;

    Promise.all([
        fetch(urlArabic).then(response => response.json()),
        fetch(urlEnglish).then(response => response.json())
    ])
    .then(data => {
        const ayahTextArabic = data[0].data.text; // Arabic text
        const ayahTextEnglish = data[1].data.text; // English translation

        // Display both Arabic and English Ayah texts
        document.getElementById("ayahText").innerHTML = `<strong>Arabic:</strong> ${ayahTextArabic}<br><strong>English:</strong> ${ayahTextEnglish}`;
    })
    .catch(error => {
        console.error('Error fetching the Ayah:', error);
        document.getElementById("ayahText").innerText = "Failed to fetch Ayah. Please check the Surah and Ayah numbers.";
    });
}