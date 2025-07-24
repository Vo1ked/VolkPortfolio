const resumes = {
    en: "https://docs.google.com/document/d/1rRv0lGzyzGsvIj3pzuihyNNVE2whi2c1zsgfa5I6Alc/edit?usp=sharing",
    uk: "https://docs.google.com/document/d/1TlJ2IJdSHs451h7sI6WYAvkaLwcRPZlNNyR4zilRiVc/edit?usp=sharing",
    ru: "https://docs.google.com/document/d/1kO0MpPcMlh27GoCWPtECDTBCV0rwQutjqRSIkOLcPcM/edit?usp=sharing"
};

const localization = {
    en: {
        name: "Volodymyr Sannikov — Unity Developer",
        resume: "📄 Open Resume",
        footer: "🔧 Found a bug? Write to"
    },
    uk: {
        name: "Володимир Санніков — Unity Розробник",
        resume: "📄 Відкрити резюме",
        footer: "🔧 Знайшли помилку? Напишіть на"
    },
    ru: {
        name: "Владимир Санников — Unity Разработчик",
        resume: "📄 Открыть резюме",
        footer: "🔧 Нашли ошибку? Пишите на"
    }
};

let currentLang = "en";

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.getElementById("name-title").textContent = localization[lang].name;
    document.getElementById("resume-button").textContent = localization[lang].resume;
    document.querySelector("footer p").innerHTML = `${localization[lang].footer} <a href=\"mailto:Volked18@gmail.com\">Volked18@gmail.com</a>`;

    document.getElementById("resume-button").onclick = () => {
        window.open(resumes[currentLang], "_blank");
    };
}

switchLanguage("en");

document.querySelectorAll(".language-switcher button").forEach(btn => {
    btn.addEventListener("click", () => {
        switchLanguage(btn.dataset.lang);
        loadProjects();
    });
});

async function loadProjects() {
    const container = document.getElementById("projects");
    const lang = currentLang;

    try {
        const listRes = await fetch("projects/list.json");
        const folders = await listRes.json();
        container.innerHTML = "";

        for (const folder of folders) {
            try {
                const res = await fetch(`projects/${folder}/project.${lang}.json`);
                const data = await res.json();

                const section = document.createElement("section");
                section.className = "project";

                const storeLinks = [];
                if (data.googlePlay) storeLinks.push(`<a href=\"${data.googlePlay}\">Google Play</a>`);
                if (data.appStore) storeLinks.push(`<a href=\"${data.appStore}\">App Store</a>`);
                const storeHTML = storeLinks.length ? `<div class=\"store-links\">${storeLinks.join('')}</div>` : "";

                const screenshotsHTML = data.screenshots.map(file => `<img src=\"projects/${folder}/${file}\" alt=\"screenshot\">`).join('');

                section.innerHTML = `
          <h2 class=\"project-title\">${data.title}</h2>
          ${storeHTML}
          <div class=\"media\">
            ${screenshotsHTML}
            <video controls>
              <source src=\"projects/${folder}/${data.video}\" type=\"video/mp4\">
            </video>
          </div>
          <div class=\"downloads\">
            ${data.apk ? `<a href=\"projects/${folder}/${data.apk}\" download>📱 Download APK</a>` : ""}
            ${data.ipa ? `<a href=\"projects/${folder}/${data.ipa}\" download>🍏 Download IPA</a>` : ""}
            ${data.webgl ? `<a href=\"projects/${folder}/${data.webgl}\" target=\"_blank\">🎮 Play in Browser</a>` : ""}
          </div>
        `;

                container.appendChild(section);
            } catch (e) {
                console.warn(`Can't load project ${folder} in lang ${lang}`);
            }
        }
    } catch (err) {
        console.error("Failed to load projects list.", err);
    }
}

window.addEventListener("DOMContentLoaded", loadProjects);
