const introMessages = [
  "Здравствуйте! Меня зовут Тамара, юрист компании «Есть Решение».",
  "Помогу вам вернуть себе финансовое спокойствие и избавиться от долгов в рамках закона.",
  "Ответьте на 5 коротких вопросов — подготовлю вариант избавления от долгов.",
];

const questions = [
  {
    id: "debt_amount",
    text: "Какая общая сумма ваших долгов?",
    options: [
      { id: "under_300", label: "До 300 000 ₽" },
      { id: "300_1000", label: "300 000–1 000 000 ₽" },
      { id: "1000_3000", label: "1 000 000–3 000 000 ₽" },
      { id: "over_3000", label: "Более 3 000 000 ₽" },
      { id: "unknown", label: "Пока не знаю точную сумму" },
    ],
  },
  {
    id: "debt_type",
    text: "Какие долги вы хотели бы списать?",
    options: [
      { id: "cards_loans", label: "Кредиты и кредитные карты" },
      { id: "microloans", label: "Микрозаймы" },
      { id: "taxes_fines_utilities", label: "Налоги, штрафы, ЖКХ" },
      { id: "business_guarantee", label: "Долги после бизнеса / поручительство" },
      { id: "mixed", label: "Несколько разных типов долгов" },
    ],
  },
  {
    id: "overdue",
    text: "Имеется ли просрочка по платежам?",
    options: [
      { id: "none", label: "Нет, но платить уже тяжело" },
      { id: "under_3_months", label: "Есть, до 3 месяцев" },
      { id: "over_3_months", label: "Более 3 месяцев" },
      { id: "court_collectors", label: "Уже есть суд, приставы или коллекторы" },
    ],
  },
  {
    id: "property",
    text: "Есть ли у вас залоговое или ценное имущество?",
    options: [
      { id: "no_property", label: "Нет" },
      { id: "only_home", label: "Только единственное жилье" },
      { id: "car", label: "Есть автомобиль" },
      { id: "mortgage_pledge", label: "Есть ипотека или залоговый кредит" },
      { id: "complex", label: "Есть доля, сделки или другое имущество" },
    ],
  },
  {
    id: "region",
    text: "В каком регионе вы находитесь?",
    options: [
      { id: "irkutsk", label: "Иркутская область" },
      { id: "moscow", label: "Москва / Московская область" },
      { id: "spb", label: "Санкт-Петербург / Ленинградская область" },
      { id: "other_russia", label: "Другой регион России" },
    ],
  },
];

const loader = document.querySelector("#loader");
const chat = document.querySelector("#chat");
const messages = document.querySelector("#messages");
const answerPanel = document.querySelector("#answerPanel");
const progressBar = document.querySelector("#progressBar");
const botTemplate = document.querySelector("#botMessageTemplate");
const userTemplate = document.querySelector("#userMessageTemplate");
const pagePath = window.location.pathname.replace(/\/+$/, "");
const linkPrefix = pagePath.endsWith("/avito") ? ".." : ".";

const state = {
  questionIndex: -1,
  answers: {},
  leadSent: false,
};

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function setProgress() {
  const answered = Math.max(state.questionIndex, 0);
  const percent = Math.min((answered / questions.length) * 100, 100);
  progressBar.style.width = `${percent}%`;
}

function addBotMessage(text) {
  const node = botTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector("p").textContent = text;
  messages.append(node);
  scrollToBottom();
}

function addUserMessage(text) {
  const node = userTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector("p").textContent = text;
  messages.append(node);
  scrollToBottom();
}

function showTyping() {
  const node = document.createElement("div");
  node.className = "message message--bot typing";
  node.innerHTML = `
    <div class="message__avatar">Т</div>
    <div class="message__bubble">
      <div class="typing-dots" aria-label="Юрист печатает">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messages.append(node);
  scrollToBottom();
  return node;
}

async function typeBotMessage(text, delay = 560) {
  const typing = showTyping();
  await wait(delay);
  typing.remove();
  addBotMessage(text);
}

function renderOptions(question) {
  answerPanel.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "options";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => handleAnswer(question, option));
    wrapper.append(button);
  });

  answerPanel.append(wrapper);
}

async function askQuestion(index) {
  state.questionIndex = index;
  setProgress();
  answerPanel.innerHTML = "";

  const question = questions[index];
  await typeBotMessage(question.text, 520);
  renderOptions(question);
}

async function handleAnswer(question, option) {
  state.answers[question.id] = {
    id: option.id,
    label: option.label,
  };

  answerPanel.innerHTML = "";
  addUserMessage(option.label);

  const nextIndex = state.questionIndex + 1;

  if (nextIndex < questions.length) {
    await wait(240);
    askQuestion(nextIndex);
    return;
  }

  state.questionIndex = questions.length;
  setProgress();
  await typeBotMessage("Спасибо, я вижу основные вводные.", 620);
  await typeBotMessage(
    "По таким вопросам нельзя обещать списание вслепую — сначала юрист проверит риски по имуществу, просрочкам и сумме долга.",
    900,
  );
  await typeBotMessage("Куда прислать вариант решения и связаться с вами?", 620);
  renderContactForm();
}

function formatPhone(value) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  if (digits && !digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);

  let formatted = "+7";

  if (digits.length > 1) {
    formatted += ` (${digits.slice(1, 4)}`;
  }

  if (digits.length >= 4) {
    formatted += `) ${digits.slice(4, 7)}`;
  }

  if (digits.length >= 7) {
    formatted += `-${digits.slice(7, 9)}`;
  }

  if (digits.length >= 9) {
    formatted += `-${digits.slice(9, 11)}`;
  }

  return formatted;
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 11;
}

function getLeadPayload(form) {
  const formData = new FormData(form);

  return {
    source: "avito_chat_quiz",
    page: window.location.href,
    submittedAt: new Date().toISOString(),
    answers: state.answers,
    contact: {
      name: formData.get("name")?.trim() || "",
      phone: formData.get("phone")?.trim() || "",
      contactMethod: formData.get("contact_method") || "",
    },
  };
}

function renderContactForm() {
  answerPanel.innerHTML = `
    <form class="contact-form" id="contactForm" novalidate>
      <label>
        <span>Ваше имя</span>
        <input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="given-name" />
      </label>

      <label>
        <span>Телефон</span>
        <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" autocomplete="tel" inputmode="tel" required />
      </label>
      <p class="field-error" id="phoneError" aria-live="polite"></p>

      <label>
        <span>Как удобнее получить информацию</span>
        <select name="contact_method" required>
          <option value="phone">Позвонить</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
        </select>
      </label>

      <label class="consent">
        <input type="checkbox" name="consent" required />
        <span>
          Я соглашаюсь на обработку персональных данных и принимаю
          <a href="${linkPrefix}/privacy.html" target="_blank" rel="noopener noreferrer">политику конфиденциальности</a>.
        </span>
      </label>

      <button class="submit-button" type="submit">Получить вариант решения</button>
    </form>
  `;

  const form = answerPanel.querySelector("#contactForm");
  const phone = form.elements.phone;
  const phoneError = answerPanel.querySelector("#phoneError");

  window.setTimeout(() => phone.focus(), 200);

  phone.addEventListener("input", () => {
    phone.value = formatPhone(phone.value);
    phoneError.textContent = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validatePhone(phone.value)) {
      phoneError.textContent = "Введите полный номер телефона";
      phone.focus();
      return;
    }

    if (!form.elements.consent.checked) {
      phoneError.textContent = "Поставьте согласие на обработку данных";
      return;
    }

    const button = form.querySelector(".submit-button");
    button.disabled = true;
    button.textContent = "Отправляем...";

    const payload = getLeadPayload(form);
    sessionStorage.setItem("debt_quiz_lead", JSON.stringify(payload));

    await wait(520);
    state.leadSent = true;
    answerPanel.innerHTML = "";
    addUserMessage(payload.contact.phone);
    await typeBotMessage(
      "Спасибо! Юрист свяжется с вами в ближайшее рабочее время и подскажет законный вариант действий.",
      760,
    );
    renderSuccessActions();
  });
}

function renderSuccessActions() {
  const wrapper = document.createElement("div");
  wrapper.className = "success-actions";
  wrapper.innerHTML = `
    <a href="${linkPrefix}/index.html">Вернуться на сайт</a>
    <a href="tel:88006003823">Позвонить: 8 800 600 38 23</a>
  `;
  answerPanel.append(wrapper);
}

async function startChat() {
  await wait(760);
  loader.hidden = true;
  loader.style.display = "none";
  chat.hidden = false;

  for (const message of introMessages) {
    await typeBotMessage(message, 620);
    await wait(160);
  }

  askQuestion(0);
}

startChat();
