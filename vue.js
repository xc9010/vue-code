import { node } from "prop-types";

class Compile{
    constructor(el, vm){
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
    }
    isElementNode() {
        return node.nodeType === 1;
    }
}

class MVue{
    constructor(options){
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