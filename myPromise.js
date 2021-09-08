const PENDING = "pending";
const FULFILLRD = "fulfilled";
const REJECTED = "rejected";
let p = new Promise((resole, reject) => {
  setTimeout(() => {
    resole();
  }, 200);
});
/**
 *
 * @param {运行函数} function1
 */
function PromiseCopy(function1) {
  let self = this; //得到该promise实例
  self.state = PENDING; //初始化状态值
  self.onFulfilled = []; //成功回调用，将所有后续函数存储，实现链式
  self.onRejected = []; //成功回调用，将所有后续函数存储，实现链式

  function resole(params) {
    console.log(params);
    if (self.state === PENDING) {
      self.state = FULFILLRD;
      self.value = params;
      self.onFulfilled.forEach((fun_item) => {
        fun_item();
      });
    }
  }
  function reject(params) {
    console.log(params);
    if (self.state === PENDING) {
      self.state = REJECTED;
      self.reason = params;
      self.onRejected.forEach((fun_item) => {
        fun_item();
      });
    }
  }
  try {
    function1(resole, reject);
  } catch (error) {
    reject(error);
  }
}
/**
 *
 */

PromiseCopy.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : function (value) {};
  onRejected =
    typeof onRejected === "function" ? onRejected : function (value) {};
  let self = this;
  let promise2 = new PromiseCopy((resolve, reject) => {
    //利用promise实现promise.闭包?
    //链式
    if (self.state === FULFILLRD) {
      setTimeout(() => {
        try {
          //前一个then函数,x表示前一个then函数的返回值
          let x = onFulfilled(self.value);
          // 处理返回值与心的promise的关系
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    } else if (self.state === REJECTED) {
      //已经得到了结果,立即执行
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    } else if (self.state === PENDING) {
      //还没等到结果.暂存函数,等到数据拿回来直接运行push进去的代码
      self.onFulfilled.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
      self.onRejected.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  });
};
function resolvePromise(promise2, x, resole, reject) {
  let self = this;
  if (promise2 === x) {
    reject(new TypeError("Chaining cycle"));
  }
  if ((x && typeof x === "object") || typeof x === "function") {
    let used;
    try {
      let then = x.then; //有没有进行多次then
      if (typeof then === "function") {
        // 中间没有其他返回值为promise的then
        //更改this指向,进行循环调用该函数,一直到我需要新的promise
        then.call(
          x,
          (y) => {
            if (used) {
              return;
            }
            used = true;
            //将下一个
            resolvePromise(promise2, y, resole, reject);
          },
          (r) => {
            if (used) {
              return;
            }
            used = true;
            reject(r);
          }
        );
      } else {
        if (used) {
          return;
        }
        used = true;
        resole(x);
      }
    } catch (error) {
      if (used) {
        return;
      }
      used = true;
      reject(error);
    }
  } else {
    //没有then了链式调用结束
    resole(x);
  }
}
