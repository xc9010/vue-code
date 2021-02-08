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
      console.log(child)

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

  }
  // 编译文本
  compileText(node) {

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
      // 2实现一个指令解析器
      new Compile(this.$el, this);
    }
  }
}
