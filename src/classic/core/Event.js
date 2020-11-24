/**
 * @class SgMap.Event
 * @classdesc 事件类。
 * @param {Object} object - 当前事件对象被添加到的 JS 对象。
 */
export default class Event {
    constructor(object) {
        this.listeners = []
        this.object = null
        this.CLASS_NAME = "SgMap.Events"
        this.object = object;
    }

    /**
     * @function SgMap.Events.prototype.destroy
     * @description 移除当前要素 element 上的所有事件监听和处理。
     */
    destroy() {
        this.listeners = [];
        this.object = null;
    }

    /**
     * @function SuperMap.Events.prototype.triggerEvent
     * @description 触发一个特定的注册事件。
     * @param {string} type - 触发事件类型。
     * @param {Event} evt - 事件对象。
     * @returns {boolean} 返回监听对象，如果返回是 false，则停止监听。
     */
    triggerEvent(type, evt) {
        let listeners = this.listeners[type];
        if (!listeners || listeners.length == 0) {
            return undefined;
        }
        //支持定义多个监听事件
        listeners = listeners.slice();
        let continueChain;
        for (let i = 0, len = listeners.length; i < len; i++) {
            let callback = listeners[i];
            continueChain = callback.func.apply(callback.obj, [evt]);
            if ((continueChain != undefined) && (continueChain == false)) {
                break;
            }
        }
        return continueChain;
    }

    on(object) {
        for (let type in object) {
            if (object.hasOwnProperty(type)) {
                this.register(type, object.scope, object[type]);
            }
        }
    }


    /**
     * @function SgMap.Events.prototype.register
     * @description 在事件对象上注册一个事件。当事件被触发时，'func' 函数被调用，假设我们触发一个事件，
     *              指定 SgMap.Bounds 作为 "obj"，当事件被触发时，回调函数的上下文作为 Bounds 对象。
     * @param {string} type - 事件注册者的名字。
     * @param {Object} [obj=this.object] - 对象绑定的回调。
     * @param {function} [func] - 回调函数，如果没有特定的回调，则这个函数不做任何事情。
     * @param {(boolean|Object)} [priority] - 当为 true 时将新的监听加在事件队列的前面。
     */
    register(type, obj, func) {
        if (func != null) {
            if (obj == null) {
                obj = this.object;
            }
            let listeners = this.listeners[type];
            if (!listeners) {
                listeners = [];
                this.listeners[type] = listeners;
            }
            let listener = {obj: obj, func: func};
            listeners.push(listener);
        }
    }


    /**
     * @function SgMap.Events.prototype.un
     * @description 在一个相同的范围内取消注册监听器的方法，此方法调用 unregister 函数。
     * @param {Object} object - 移除监听的对象。
     */
    un(object) {
        for (let type in object) {
            if (type !== "scope" && object.hasOwnProperty(type)) {
                this.unregister(type, object.scope, object[type]);
            }
        }
    }

    /**
     * @function SgMap.Events.prototype.unregister
     * @description 取消注册。
     * @param {string} type - 事件类型。
     * @param {Object} [obj=this.object] - 对象绑定方面的回调。
     * @param {function} [func] - 回调函数，如果没有特定的回调，则这个函数不做任何事情。
     */
    unregister(type, obj, func) {
        if (obj == null) {
            obj = this.object;
        }
        let listeners = this.listeners[type];
        if (listeners != null) {
            for (let i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].obj === obj && listeners[i].func === func) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }

}

