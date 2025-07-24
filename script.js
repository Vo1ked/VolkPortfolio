const resumes = {
    en: "https://docs.google.com/document/d/1rRv0lGzyzGsvIj3pzuihyNNVE2whi2c1zsgfa5I6Alc/edit?usp=sharing",
    uk: "https://docs.google.com/document/d/1TlJ2IJdSHs451h7sI6WYAvkaLwcRPZlNNyR4zilRiVc/edit?usp=sharing",
    ru: "https://docs.google.com/document/d/1kO0MpPcMlh27GoCWPtECDTBCV0rwQutjqRSIkOLcPcM/edit?usp=sharing"
};

let currentLang = "en";

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.getElementById("resume-button").onclick = () => {
        window.open(resumes[currentLang], "_blank");
    };

    // Future: load translated content via data attributes or fetch
    // document.querySelectorAll("[data-lang-content]").forEach(el => ...)
}

// Default language init
switchLanguage("en");

document.querySelectorAll(".language-switcher button").forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
});
