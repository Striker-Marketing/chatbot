const setUpChat = ({ formId, buttonId, mapsKey, items, waitingTime, noScrollDown }) => {
  let iti;
  const form = document.getElementById(formId);
  form.classList.add("chat");
  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  let spinner = document.createElement("div");
  spinner.innerHTML =
    '<svg id="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><style>.spinner_S1WN{animation:spinner_MGfb .8s linear infinite;animation-delay:-.8s}.spinner_Km9P{animation-delay:-.65s}.spinner_JApP{animation-delay:-.5s}@keyframes spinner_MGfb{93.75%,100%{opacity:.2}}</style><circle class="spinner_S1WN" cx="4" cy="12" r="3"/><circle class="spinner_S1WN spinner_Km9P" cx="12" cy="12" r="3"/><circle class="spinner_S1WN spinner_JApP" cx="20" cy="12" r="3"/></svg>';
  spinner = spinner.firstChild;

  const createMessage = (params) => {
    const message = document.createElement("div");
    message.innerHTML = params.question;
    message.classList.add("message");
    message.classList.add("message-bot");
    if (params.type === "submit") message.classList.add("has-pic");
    return message;
  };

  const createResponse = (text) => {
    const response = document.createElement("div");
    response.innerHTML = text;
    response.classList.add("message");
    response.classList.add("message-user");
    return response;
  };

  const handleSubmitQuestion = (input) => {
    if (input.value.trim() !== "" && input.checkValidity() && (input.id !== "phone_number" || (input.id === "phone_number" && iti.isValidNumber()))) input.type = "hidden";
    else input.classList.add("invalid-input");
  };

  const createInput = (params) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("text-input");
    const button = document.createElement("button");
    button.type = "button";
    const input = document.createElement("input");
    if (params.type === "address" || params.type === "name") {
      input.type = "text";
    } else input.type = params.type;
    input.required = "required";
    input.id = params.inputId;
    input.name = params.inputId;
    input.classList.add("w-input");
    input.placeholder = "Type here...";
    wrapper.appendChild(input);
    wrapper.appendChild(button);
    button.addEventListener("click", () => handleSubmitQuestion(input));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSubmitQuestion(input);
      }
    });
    return wrapper;
  };

  const createOptions = (params) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("select-wrapper");
    params.options.forEach((option) => {
      const input = document.createElement("input");
      const label = document.createElement("label");
      label.innerHTML = option.text;
      label.for = option.id;
      input.type = "radio";
      input.id = option.id;
      input.value = option.text;
      input.name = params.optionsName;
      input.classList.add("w-radio-input");
      label.appendChild(input);
      wrapper.appendChild(label);
    });
    return wrapper;
  };

  const handleItem = (item, position) => {
    const addQuestion = (question) => {
      if (position) {
        questions.splice(position, 0, question);
        return;
      }
      questions.push(question);
    };
    switch (item.type) {
      case "no-input":
      case "submit": {
        addQuestion({ type: item.type, element: createMessage(item), waitingTime: item.waitingTime });
        break;
      }

      case "text":
      case "number":
      case "name":
      case "tel":
      case "address":
      case "email": {
        const message = createMessage(item);
        message.appendChild(createInput(item));
        addQuestion({ type: item.type, element: message });
        break;
      }

      case "options": {
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper");
        wrapper.appendChild(createMessage(item));
        wrapper.appendChild(createOptions(item));
        addQuestion({ type: "option-question", element: wrapper, nextItems: item.nextItems });
        break;
      }
    }
  };

  const questions = [];
  items.forEach((item) => handleItem(item));

  const scrollToBottom = () => {
    if (!noScrollDown) document.documentElement.scrollTop = document.documentElement.scrollHeight;
  };

  const handleNextQuestion = async (nextStep, maxStep, customWaitingTime) => {
    if (nextStep === maxStep) return;
    form.appendChild(spinner);
    scrollToBottom();
    await delay(customWaitingTime || waitingTime);
    handleQuestions(nextStep);
    scrollToBottom();
  };

  const handleQuestions = async (step = 0) => {
    document.getElementById("spinner")?.remove();
    const nextStep = step + 1;
    const maxStep = questions.length;
    const { type, element, ...params } = questions[step];
    switch (type) {
      case "no-input": {
        form.appendChild(element);
        handleNextQuestion(nextStep, maxStep, params.waitingTime);
        break;
      }
      case "text":
      case "number":
      case "name":
      case "tel":
      case "address":
      case "email": {
        const input = element.querySelector("input");
        form.appendChild(element);
        if (type === "address") {
          let autocomplete, address1Field;
          function initAutocomplete() {
            (address1Field = input), (autocomplete = new google.maps.places.Autocomplete(address1Field, { componentRestrictions: { country: ["us"] }, fields: ["formatted_address"], types: ["address"] })), address1Field.focus(), autocomplete.addListener("place_changed", fillInAddress);
          }
          function fillInAddress() {
            address1Field.value = autocomplete.getPlace().formatted_address || "";
          }
          window.initAutocomplete = initAutocomplete;
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&callback=initAutocomplete&libraries=places&v=weekly`;
          script.async = true;
          document.head.appendChild(script);
        } else if (type === "tel") {
          let link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/css/intlTelInput.css";
          document.head.appendChild(link);
          let style = document.createElement("style");
          style.textContent = ".iti{width:100%;}";
          document.head.appendChild(style);
          let script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/js/intlTelInput.min.js";
          script.onload = () => {
            const getTopLevelDomain = () => {
              const fullDomain = window.location.hostname;
              const domainRegex = /\.([a-z]{2,})\.([a-z]{2,})$/;
              const match = fullDomain.match(domainRegex);
              if (match) {
                return `.${match[1]}.${match[2]}`;
              } else {
                return fullDomain;
              }
            };
            const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;
            iti = window.intlTelInput(input, {
              utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.3.2/build/js/utils.js",
              autoPlaceholder: "aggressive",
              initialCountry: "auto",
              geoIpLookup: async (success, failure) => {
                try {
                  const cookieCountry = document.cookie.split("user_country=")[1]?.split(";")[0];
                  if (cookieCountry) {
                    success(cookieCountry);
                    return;
                  }
                  const response = await fetch("https://get.geojs.io/v1/ip/country.json");
                  const data = await response.json();
                  if (response.ok) {
                    document.cookie = `user_country=${data.country};${cookieConfig}`;
                    success(data.country);
                  } else throw new Error("Error Fetching Ip", response, data);
                } catch (e) {
                  console.warn(e);
                  failure();
                }
              },
            });
          };
          document.head.appendChild(script);
        }
        input.focus();
        const handleQuestionSubmit = () => {
          if (input.value.trim() !== "" && input.checkValidity() && (input.id !== "phone_number" || (input.id === "phone_number" && iti.isValidNumber()))) {
            if(type === "name"){
              questions.slice(nextStep).forEach(question=>{
                question.element.childNodes[0].textContent = question.element.childNodes[0].textContent.replace("[Name]", input.value.trim())
              })
            }
            form.appendChild(createResponse(input.value));
            handleNextQuestion(nextStep, maxStep);
          } else input.classList.add("invalid-input");
        };
        element.querySelector("button").addEventListener("click", handleQuestionSubmit);
        input.addEventListener("keydown", (e) => e.key === "Enter" && handleQuestionSubmit(input));
        break;
      }
      case "option-question": {
        form.appendChild(element);
        element.querySelectorAll("input").forEach((input) =>
          input.addEventListener("change", () => {
            const value = element.querySelector("input:checked").value;
            form.appendChild(createResponse(value));
            if (params.nextItems && params.nextItems[value]) {
              const items = params.nextItems[value];
              if (Array.isArray(items)) {
                items.forEach((item, i) => {
                  handleItem(item, nextStep + i);
                });
              } else handleItem(items, nextStep);
            }
            handleNextQuestion(nextStep, maxStep);
          })
        );
        break;
      }
      case "submit": {
        form.appendChild(element);
        form.appendChild(spinner);
        const button = document.getElementById(buttonId);
        window.onbeforeunload = null;
        button.click();
        break;
      }
    }
  };

  handleQuestions();

  window.onbeforeunload = function (event) {
    const message = "Are you sure you want to leave? Any unsaved changes will be lost.";
    event.returnValue = message;
    return message;
  };
};
