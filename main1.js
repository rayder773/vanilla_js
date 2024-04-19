class Entity {
  _eventListeners = {};
  _children = [];

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

class Component extends Entity {
  page;
  id;
  className;
  content;
  tagName;

  constructor({
    tagName = "div",
    content = [],
    id = "",
    className = "",
    page = null,
  }) {
    super();

    if (!Array.isArray(content)) {
      content = [content];
    }

    content = content
      .map((child) => {
        if (child instanceof Component) {
          this.addChild(child);
          return child.html;
        }

        return child;
      })
      .join("");

    this.content = content;

    this.page = page;
    this.id = id;
    this.className = className;
    this.tagName = tagName;
  }

  get html() {
    return `
      <${this.tagName} 
        id="${this.id}" 
        class="${this.className}"
      >
        ${this.content}
      </${this.tagName}>
    `;
  }

  start() {
    super.start();

    for (const event in this._eventListeners) {
      this._eventListeners[event].forEach((callback) => {
        document.getElementById(this.id).addEventListener(event, callback);
      });
    }
  }

  stop() {
    super.stop();

    for (const event in this._eventListeners) {
      this._eventListeners[event].forEach((callback) => {
        document.getElementById(this.id).removeEventListener(event, callback);
      });
    }
  }

  textContent(text) {
    document.getElementById(this.id).textContent = text;
  }

  append(child) {
    this._children.push(child);

    document.getElementById(this.id).append(child.html);
  }
}

class Page extends Entity {
  app;
  script;
  startFunction;
  body;
  dependencies = new Set();

  constructor({
    script = "",
    startFunction = "function() {}",
    body = [],
  } = {}) {
    super();

    this.script = script;
    this.startFunction = startFunction;

    if (!Array.isArray(body)) {
      body = [body];
    }

    body = body
      .map((child) => {
        if (child instanceof Component) {
          this.addChild(child);

          return child.html;
        }

        return child;
      })
      .join("");

    this.body = body;
  }

  addChild(child) {
    child.page = this;

    let proto = child;

    let str = "";

    while (proto.constructor.name !== "Object") {
      const constructorName = proto.constructor.name;

      if (!this.dependencies.has(constructorName)) {
        str = proto.constructor + "\n" + str;
        this.dependencies.add(constructorName);
      }

      proto = proto.__proto__;
    }

    this.script = str;

    super.addChild(child);
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

  scriptTag = (inner) => {
    return `
      <script defer>
        ${inner}
        (${this.startFunction})(${App})
      <\/script>
    `;
  };

  bodyTag(inner) {
    return `
      <body>
        ${inner}
      </body>
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

class App {
  constructor() {
    this.ids = {
      button: "button",
      list: "list",
      dropdown: "dropdown",
    };

    this.button = new Component({
      tagName: "button",
      id: this.ids.button,
      content: "Click me!",
    });

    this.button.on("click", () => {
      console.log("open dropdown");
    });

    this.ul = new Component({
      tagName: "ul",
      id: this.ids.list,
    });

    this.dropdown = new Component({
      tagName: "div",
      id: this.ids.dropdown,
      content: [this.button, this.ul],
    });

    this.homePage = new Page({
      body: [this.dropdown],
    });
  }
}

const app = new App();

app.homePage.startFunction = (Page) => {
  const page = new Page();
};

const html = app.homePage.html;

document.open();
document.write(html);
document.close();

// const app1 = new App();

// app1.homePage.start();
