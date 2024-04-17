class Element {
  constructor() {
    this._id = "";
    this._className = "";
  }

  setId(id) {
    this._id = id;

    return this;
  }

  setClassName(className) {
    this._className = className;

    return this;
  }
}

class InputElement extends Element {
  constructor() {
    super();
    this._type = "text";
    this._value = "";
    this._disabled = false;
    this._name = "";
  }

  setType(type) {
    this._type = type;

    return this;
  }

  setValue(value) {
    this._value = value;

    return this;
  }

  setDisabled(disabled) {
    this._disabled = disabled;

    return this;
  }

  setName(name) {
    this._name = name;

    return this;
  }

  get html() {
    return `<input type="${this._type}" id="${this._id}" value="${
      this._value
    }" name="${this._name}" ${this._disabled ? "disabled" : ""}>`;
  }
}

class ButtonElement extends Element {
  constructor() {
    super();
    this._type = "button";
    this._value = "";
    this._disabled = false;
  }

  setType(type) {
    this._type = type;

    return this;
  }

  setValue(value) {
    this._value = value;

    return this;
  }

  setDisabled(disabled) {
    this._disabled = disabled;

    return this;
  }

  get html() {
    return `<button 
      ${this._id ? `id="${this._id}"` : ""}
      type="${this._type}" 
      ${this._disabled ? "disabled" : ""}
    >
      ${this._value}
    </button>`;
  }
}

class FormElement extends Element {
  constructor() {
    super();
    this.usernameInput = new InputElement();
    this.usernameInput.setType("text").setName("username");
    this.passwordInputElement = new InputElement();
    this.passwordInputElement.setType("password").setName("password");
    this.submitButton = new ButtonElement();
    this.submitButton.setType("submit").setValue("Login");
  }

  get html() {
    return `<form id="${this._id}" class="${this._className}">
      ${this.usernameInput.html}
      ${this.passwordInputElement.html}
      ${this.submitButton.html}
    </form>`;
  }
}

class LoginPage {
  constructor() {
    this.formElement = new FormElement();
    this.removeButton = new ButtonElement();
    this.removeButton.setValue("Remove");
  }

  get html() {
    return `${this.formElement.html}${this.removeButton.html}`;
  }
}

class App {
  constructor() {
    this.loginPage = new LoginPage();
  }

  render() {
    document.body.innerHTML = this.loginPage.html;
  }
}

const app = new App();

const ids = {
  formId: "login-form",
  usernameInputId: "username-input",
  removeButtonId: "remove-button",
};

const classNames = {
  formClassName: "login-form-class",
};

app.loginPage.formElement.setId(ids.formId);
app.loginPage.formElement.usernameInput.setId(ids.usernameInputId);
app.loginPage.formElement.setClassName(classNames.formClassName);
app.loginPage.removeButton.setId(ids.removeButtonId);

app.render();

class Controller {
  _id = "";
  _events = {};
  _children = [];

  getElement() {
    return document.getElementById(this._id);
  }

  addEventListener(event, callback) {
    this.getElement().addEventListener(event, callback);

    return this;
  }

  removeEventListener(event, callback) {
    this.getElement().removeEventListener(event, callback);

    return this;
  }

  addChild(child) {
    this._children.push(child);

    return this;
  }

  setEvents(events) {
    this._events = events;

    return this;
  }

  setId(id) {
    this._id = id;

    return this;
  }

  setValue(value) {
    this.getElement().value = value;
  }

  stop() {
    for (let event in this._events) {
      if (!Array.isArray(this._events[event])) {
        this._events[event] = [this._events[event]];
      }

      this._events[event].forEach((callback) => {
        this.removeEventListener(event, callback);
      });
    }

    this._children.forEach((child) => {
      child.stop();
    });

    this._children = [];

    this._events = {};
  }

  start() {
    for (let event in this._events) {
      if (!Array.isArray(this._events[event])) {
        this._events[event] = [this._events[event]];
      }

      this._events[event].forEach((callback) => {
        this.addEventListener(event, callback);
      });
    }

    this._children.forEach((child) => {
      child.start();
    });
  }
}

class LoginFormController extends Controller {
  constructor() {
    super();
    this.usernameInputController = new Controller()
      .setId(ids.usernameInputId)
      .setEvents({
        input: this.onUsernameChange,
      });

    this.addChild(this.usernameInputController);
  }

  getUsernameInputController() {
    return this.usernameInputController;
  }

  onUsernameChange(e) {
    console.log("username", e.target.value);
  }
}

class LoginPageController extends Controller {
  constructor() {
    super();
    this._loginFormController = new LoginFormController().setId(ids.formId);
    this._removeButtonController = new Controller()
      .setId(ids.removeButtonId)
      .setEvents({
        click: this.onRemoveClick,
      });

    this.addChild(this._removeButtonController);
    this.addChild(this._loginFormController);
  }

  getLoginFormController() {
    return this._loginFormController;
  }

  onRemoveClick = () => {
    this.stop();
  };

  onFormSubmit(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    console.log("username", username);
    console.log("password", password);
  }
}

class AppController extends Controller {
  constructor() {
    super();
    this._loginPageController = new LoginPageController();
    this.addChild(this._loginPageController);
  }

  getLoginPageController() {
    return this._loginPageController;
  }
}

const appController = new AppController();

appController.start();

const input = appController
  .getLoginPageController()
  .getLoginFormController()
  .getUsernameInputController();

setTimeout(() => {
  input.setValue("333");
}, 2000);
