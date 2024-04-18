class Component {
  _eventListeners = {};
  _children = [];

  get html() {
    return "";
  }

  on(event, callback) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }

    this._eventListeners[event].push(callback);
  }

  start() {
    this._children.forEach((child) => child.start());
  }

  stop() {
    this._children.forEach((child) => child.stop());
  }

  addChild(child) {
    this._children.push(child);

    return child.html;
  }
}

class Element extends Component {
  page = null;
  _id = "";
  className = "";
  textContent = "";

  create(tagName) {
    return `
      <${tagName} 
        id="${this._id}" 
        class="${this.className}"
      >
        ${this.textContent}
      </${tagName}>
    `;
  }

  start() {
    super.start();

    for (const event in this._eventListeners) {
      this._eventListeners[event].forEach((callback) => {
        document.getElementById(this._id).addEventListener(event, callback);
      });
    }
  }

  stop() {
    super.stop();

    for (const event in this._eventListeners) {
      this._eventListeners[event].forEach((callback) => {
        document.getElementById(this._id).removeEventListener(event, callback);
      });
    }
  }

  textContent(text) {
    document.getElementById(this._id).textContent = text;
  }
}

class Button extends Element {
  _id = "button";

  constructor() {
    super();
  }

  get html() {
    return this.create("button");
  }
}

class DropdownButton extends Button {
  _id = "dropdown-button";
}

class Dropdown extends Element {
  _id = "dropdown";

  constructor() {
    super();

    this.button = new DropdownButton();
  }

  get html() {
    return `
      <div class="dropdown">
        ${this.add(this.button)}
        <div class="dropdown-content"></div>
      </div>
    `;
  }

  start() {
    this.button.on("click", this.open);
  }

  open = () => {
    console.log("open dropdown");
  };
}

class Page extends Component {
  script = "";
  startFunction = "";

  constructor() {
    super();
  }

  addChild(child) {
    this.script += child.constructor;

    child.page = this;

    return this.addChild(child);
  }

  get DOCTYPE() {
    return "<!DOCTYPE html>";
  }

  get title() {
    return "Page";
  }

  get styles() {
    return `
      <style></style>
    `;
  }

  get head() {
    return `
      <head>
        <title>${this.title}</title>
        ${this.styles}
      </head>
    `;
  }

  scriptTag(inner) {
    return `
      <script defer>
        ${inner}
        (${this.startFunction})(${this.constructor})
      <\/script>
    `;
  }

  bodyTag(inner) {
    return `
      <body>
        ${inner}
      </body>
    `;
  }

  get body() {
    return `
      <h1>Page</h1>
    `;
  }

  get html() {
    return `
      ${this.DOCTYPE}
      <html>
        ${this.head}
        ${this.bodyTag(this.body)}
        ${this.scriptTag(this.script)}
      </html>
    `;
  }
}

class HomePage extends Page {
  script = Component + Page + HomePage + Button + DropdownButton;

  constructor() {
    super();
    this.dropdown = new Dropdown();
  }

  get body() {
    return `
      <h1>Home Page</h1>
      ${this.add(this.dropdown)}
    `;
  }

  start() {
    this.addChild(this.dropdown);

    super.start();
  }
}

const page = new HomePage();

page.startFunction = function (page) {
  const p = new page();

  p.start();
};

document.open();
document.write(page.html);
document.close();
