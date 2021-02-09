const compileUtil = {
  getVal(expr, vm) {
    return expr.split('.').reduce((data, cur) => {
      return data[cur]
    }, vm.$data)
  },
  //获取新值 对{{a}}--{{b}} 这种格式进行处理
  getContentVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getVal(args[1], vm);
    })
  },

  text(node, expr, vm) {
    let value;
    if (expr.indexOf('{{') !== -1) {
      value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        new Watcher(vm, args[1], () => {
          this.updater.textUpdater(node, this.getContentVal(expr, vm))
        });
        return this.getVal(args[1], vm);
      })
    } else {
      value = this.getVal(expr, vm);
    }
    this.updater.textUpdater(node, value);
  },
  html(node, expr, vm) {
    const value = this.getVal(expr, vm);
    new Watcher(vm, expr, (newVal) => {
      this.updater.htmlUpdater(node, newVal)
    });
    this.updater.htmlUpdater(node, value);

  },
  model(node, expr, vm) {
    const value = this.getVal(expr, vm);
    new Watcher(vm, expr, (newVal) => {
      this.updater.modelUpdater(node, newVal)
    });
    this.updater.modelUpdater(node, value);

  },
  on(node, expr, vm, eventName) {
    const fn = vm.$options.methods && vm.$options.methods[expr];
    node.addEventListener(eventName, fn.bind(vm), false)
  },
  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    }
  }
};

class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 1获取文档碎片对象，放入内存中减少性能消耗，回流重绘
    const fragment = this.node2fragment(this.el)
    // 2编译模板
    this.compile(fragment)
    // 3追加子元素到根元素
    this.el.appendChild(fragment)
  }

  compile(fragment) {
    // 1获取子节点
    const childNodes = fragment.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        // 元素节点
        this.compileElement(child)
      } else {
        // 文本节点
        this.compileText(child)
      }

      if (child.childNodes && child.childNodes.length) {
        this.compile(child)
      }
    });
  }

  // 编译节点
  compileElement(node) {
    const attr = node.attributes;
    [...attr].forEach(v => {
      const { name, value } = v;
      if (this.isDirective(name)) {
        // 忽略第一个v-,directive是model这些
        const [, directive] = name.split('-');
        // 继续分割on:click这些
        const [dirName,eventName ] = directive.split(':');
        compileUtil[dirName] && compileUtil[dirName](node, value, this.vm, eventName);
        // 删除标签上的属性
        node.removeAttribute('v-'+ directive);
      } else if (this.isEventName(name)) {
        const [, eventName] = name.split('@');
        compileUtil['on'](node, value, this.vm, eventName)
      }
    })
  }
  // 编译文本
  compileText(node) {
    const content = node.textContent;
    // 匹配{{xxx}}的内容
    if (/\{\{(.+?)\}\}/.test(content)) {
      // 处理文本节点
      compileUtil['text'](node, content, this.vm)
    }
  }

  // 是否是@click这样事件名字
  isEventName(attrName){
    return attrName.startsWith('@')
  }

  //判断是否是一个指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  node2fragment(el) {
    // 创建文档碎片
    const f = document.createDocumentFragment();
    let firstChild;
    while (firstChild = el.firstChild) {
      f.appendChild(firstChild)
    }
    return f;
  }
}

class MVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;
    if (this.$el) {
      // 1实现一个数据观察者
      new Observer(this.$data);
      // 2实现一个指令解析器
      new Compile(this.$el, this);
    }
  }
}
