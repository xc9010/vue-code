class Watcher{
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 保存旧值
    this.oldVal = this.getOldVal()
  }
  getOldVal() {
    // 先挂载
    Dep.target = this;
    const oldVal = compileUtil.getVal(this.expr, this.vm);
    // 再删除
    Dep.target = null;
    return oldVal;
  }
  update() {
    const newVal = compileUtil.getVal(this.expr, this.vm);
    if (newVal !== this.oldVal) {
      this.cb(newVal)
    }
  }

}

class Dep{
  constructor() {
    this.subs = [];
  }
  // 收集watcher
  addSub(watcher){
    this.subs.push(watcher);
  }
  // 通知观察者去更新
  notify() {
    console.log('通知了观察者')
    this.subs.forEach(w => {
      // 通知了观察者
      w.update()
    })
  }
}

class Observer{
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    // 当前data是一个对象时候才监听
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key])
      })
    }
  }


  defineReactive(obj,key,value){
    // 循环递归 对所有层的数据进行观察
    this.observe(value);//这样obj也能被观察了
    const dep = new Dep();
    Object.defineProperty(obj,key,{
      get(){
        // 订阅数据变化时候，往dep中添加观察者
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set:(newVal)=>{
        if (newVal !== value){
          // 如果外界直接修改对象 则对新修改的值重新观察
          this.observe(newVal);
          value = newVal;
        }
        // 通知变化
        dep.notify();
      }
    })
  }

}
