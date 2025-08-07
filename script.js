const resumes = {
    en: "https://docs.google.com/document/d/ENGLISH_RESUME_ID",
    ua: "https://docs.google.com/document/d/UKRAINIAN_RESUME_ID",
    ru: "https://docs.google.com/document/d/RUSSIAN_RESUME_ID"
};

const localization = {
    en: {
        name: "Volodymyr Sannikov — Unity Developer",
        description: "This portfolio includes only non-NDA projects, which constitute the majority, and all were completed within the past year. Each project can be played in the browser or downloaded for Android, and portions of the source code are also available for review and download.",
        resume: "📄 Open Resume",
        footer: "🔧 Found a bug? Write to"
    },
    ua: {
        name: "Володимир Санніков — Unity Розробник",
        description: "Це портфоліо містить виключно проєкти, не захищені NDA (які становлять більшість) та виконані протягом останнього року. Кожен із проєктів можна запустити в браузері або завантажити на Android, а також доступні для завантаження фрагменти вихідного коду.",
        resume: "📄 Відкрити резюме",
        footer: "🔧 Знайшли помилку? Напишіть на"
    },
    ru: {
        name: "Владимир Санников — Unity Разработчик",
        description: "Данное портфолио содержит только проекты которые были не под NDA, которых большинство, и были сделаны за последний год проекты можно поиграть в браузере или скачать на android так же доступны для скачивания части кода из проекта.",
        resume: "📄 Открыть резюме",
        footer: "🔧 Нашли ошибку? Пишите на"
    }
};

let currentLang = "en";

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.getElementById("name-title").textContent = localization[lang].name;
    document.getElementById("subtitle").textContent = localization[lang].description;
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
    const template = document.getElementById("project-template").content;
    container.innerHTML = "";

    let folders;
    try {
        folders = await (await fetch("projects/list.json")).json();
    } catch {
        console.error("Failed to load projects list.");
        return;
    }

    for (const folder of folders) {
        let data;
        try {
            data = await (await fetch(`projects/${folder}/project.${currentLang}.json`)).json();
        } catch {
            console.warn(`Can't load project ${folder} in lang ${currentLang}`);
            continue;
        }

        // Клонируем шаблон
        const clone = document.importNode(template, true);
        const section = clone.querySelector("section");

        // Store links
        const storeLinksContainer = clone.querySelector(".store-links");
        if (data.googlePlay) {
            const a = document.createElement("a");
            a.href = data.googlePlay;
            a.textContent = "Google Play";
            storeLinksContainer.append(a);
        }
        if (data.appStore) {
            const a = document.createElement("a");
            a.href = data.appStore;
            a.textContent = "App Store";
            storeLinksContainer.append(a);
        }

        // Видео
        const sourceEl = clone.querySelector("video source");
        sourceEl.src = `projects/${folder}/${data.video}`;
        sourceEl.type = "video/mp4";

        // Текстовые поля
        clone.querySelector(".project-title").textContent = data.title;
        clone.querySelector(".project-description").textContent = data.description;

        // Скриншоты
        const imagesContainer = clone.querySelector(".images");
        data.screenshots.forEach((file, idx) => {
            const img = document.createElement("img");
            img.src = `projects/${folder}/${file}`;
            img.alt = `screenshot ${idx + 1}`;
            img.classList.add("clickable-thumbnail");
            img.addEventListener("click", () => enableImagePopup(
                Array.from(section.querySelectorAll(".clickable-thumbnail")),
                idx
            ));
            imagesContainer.append(img);
        });

        // Ссылки на загрузку
        const downloads = clone.querySelector(".downloads");
        if (data.apk) {
            const a = document.createElement("a");
            a.href = `projects/${folder}/${data.apk}`;
            a.download = "";
            a.textContent = "📱 Download APK";
            downloads.append(a);
        }
        if (data.ipa) {
            const a = document.createElement("a");
            a.href = `projects/${folder}/${data.ipa}`;
            a.download = "";
            a.textContent = "🍏 Download IPA";
            downloads.append(a);
        }
        if (data.webgl) {
            const a = document.createElement("a");
            a.href = `projects/${folder}/${data.webgl}`;
            a.target = "_blank";
            a.textContent = "🎮 Play in Browser";
            downloads.append(a);
        }

        container.appendChild(clone);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    switchLanguage(currentLang);
    loadProjects();
});
