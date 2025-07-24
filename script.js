const resumes = {
    en: "https://docs.google.com/document/d/ENGLISH_RESUME_ID",
    uk: "https://docs.google.com/document/d/UKRAINIAN_RESUME_ID",
    ru: "https://docs.google.com/document/d/RUSSIAN_RESUME_ID"
};

const localization = {
    en: {
        name: "Volodymyr Sannikov — Unity Developer",
        resume: "📄 Open Resume",
        footer: "🔧 Found a bug? Write to"
    },
    ua: {
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

function enableImagePopup(images, currentIndex = 0) {
    const full = document.createElement("div");
    full.className = "image-popup";

    full.innerHTML = `
    <div class="wrapper">
      <img src="${images[currentIndex].src}" />
      <span class='close'>&times;</span>
      <span class='arrow left'>&larr;</span>
      <span class='arrow right'>&rarr;</span>
    </div>
  `;
    document.body.appendChild(full);

    const imgEl = full.querySelector("img");
    const updateImage = () => (imgEl.src = images[currentIndex].src);

    function closePopup() {
        full.remove();
        document.removeEventListener("keydown", escListener);
    }

    const escListener = (e) => {
        if (e.key === "Escape") closePopup();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    const prev = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    };

    const next = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    };

    full.querySelector(".close").addEventListener("click", closePopup);
    full.addEventListener("click", (e) => {
        if (e.target === full) closePopup();
    });
    full.querySelector(".arrow.left").addEventListener("click", (e) => {
        e.stopPropagation();
        prev();
    });
    full.querySelector(".arrow.right").addEventListener("click", (e) => {
        e.stopPropagation();
        next();
    });

    document.addEventListener("keydown", escListener);
}

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
            <video controls preload=\"metadata\">
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

                const imgs = Array.from(section.querySelectorAll(".media img"));
                imgs.forEach((img, idx) => {
                    img.classList.add("clickable-thumbnail");
                    img.addEventListener("click", () => enableImagePopup(imgs, idx));
                });

            } catch (e) {
                console.warn(`Can't load project ${folder} in lang ${lang}`);
            }
        }
    } catch (err) {
        console.error("Failed to load projects list.", err);
    }
}

window.addEventListener("DOMContentLoaded", loadProjects);
