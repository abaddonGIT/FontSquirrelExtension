/**
 * Created by abaddon on 22.11.2014.
 */
var d = document, ch = chrome,
    FontConverterStrategy = function () {
    };

FontConverterStrategy.prototype = {
    run: function () {
        this.target = d.querySelector("input[type=file]");//Источник
        this.preloder = d.querySelector("#preloder");//прелодер
        this.finalBlock = d.querySelector("#finalBlock");
        this.agreement = this.finalBlock.querySelector("#agreement");

        this.init();
    },
    removeEvents: function () {/*Удаляет обработчик события*/
        this.target.removeEventListener("change");
    },
    createXHR: function (formDatas, url, blob) {/*Создание объекта запроса*/
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest(),
                form = new FormData();

            formDatas.forEach(function (k, v) {
                form.append(k.name, k.value);
            });

            if (blob) {
                xhr.responseType = 'blob';
            }

            xhr.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.response);
                }
            };
            xhr.onabort = function () {
                reject(Error("Network Abort"));
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            xhr.open('POST', url, true);
            xhr.send(form);
        });
    },
    collectionValue: function (form) {/*Соберает все данные из формы в виде объекта*/
        var inputs = form.querySelectorAll("input"), ln = inputs.length, data = [];
        while (ln--) {
            var loc = inputs[ln];
            data.push({
                name: loc.getAttribute("name"),
                value: loc.files ? loc.files[0] : loc.value
            });
            if (loc.files) {
                data.push({
                    name: "Filename",
                    value: loc.value.replace("C:\\fakepath\\", "")
                });
            }
        }

        return data;
    },
    loderState: function (state) {
        state ? this.preloder.style.display = "block" : this.preloder.style.display = "none";
    },
    showNotification: function (message, name) {
        var config = {
            type: "basic",
            title: "",
            message: message,
            iconUrl: "../img/icon_128.png"
        };
        ch.notifications.getAll(function (notifications) {
            if (notifications[name]) {
                ch.notifications.clear(name, function () {
                    ch.notifications.create(name, config, function () {
                    });
                });
            } else {
                ch.notifications.create(name, config, function () {
                });
            }
        });
    },
    clearForm: function () {
        this.target.value = "";
        this.agreement.checked = false;
    }
};