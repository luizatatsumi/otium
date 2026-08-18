const button = document.querySelector("#roll-button");
const articleArea = document.querySelector("#article");
const logoO = document.querySelector(".logo-o");

button.addEventListener("click", () => {
  logoO.classList.add("is-rolling");
  button.textContent = "rolling...";

  setTimeout(() => {
    const article =
      window.articles[
        Math.floor(Math.random() * window.articles.length)
      ];

    const paragraphs = article.paragraphs
      .map(paragraph => `<p>${paragraph}</p>`)
      .join("");

    const questions = article.questions
      .map(question => `<li>${question}</li>`)
      .join("");

    const sources = article.sources
      .map(source => `
        <li>
          <a href="${source.url}" target="_blank">
           blank">
            ${source.name}
          </a>
        </li>
      `)
      .join("");

    articleArea.innerHTML = `
      <p>${article.category} · ${article.readingTime}</p>

      <h2>${article.title}</h2>

      <p><strong>${article.dek}</strong></p>

      ${paragraphs}

      <h3>Agora fale sobre o que você leu</h3>
      <ol>${questions}</ol>

      <h3>Fontes</h3>
      <ul>${sources}</ul>
    `;

    articleArea.hidden = false;

    logoO.classList.remove("is-rolling");
    button.textContent = "roll another article";

    articleArea.scrollIntoView({
      behavior: "smooth"
    });
  }, 700);
});
