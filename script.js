document.addEventListener("DOMContentLoaded", function () {
    const fields = document.querySelectorAll(".value"); // Находим все поля с данными
    const selectElements = document.querySelectorAll(".factor"); // Находим все поля с данными
    let changedFields = []; // Массив для хранения последних двух измененных полей

    document.querySelector(".calcOma-widget").addEventListener("input", function (e) {
        if (e.target.classList.contains("value")) {
            e.target.value = e.target.value.replace(",", ".");
            e.target.value = e.target.value.replace(/[^.\d]/g, "");
            e.target.value = e.target.value.replace(/^\./, "0.");
            const parts = e.target.value.split(".");
            if (parts.length > 1) {
                e.target.value = parts[0] + "." + parts.slice(1).join("");
            }
            e.target.value = e.target.value.replace(/^0+(?=\d)/, "");
            e.target.value = e.target.value.replace(/^([\d\.]{1,16})?.*/, "$1");
            //alert(1);
            calculated();
        }
    });

    document.querySelector(".calcOma-widget").addEventListener("click", function (e) {
        if (e.target.classList.contains("value")) {
            changeFieldColor(e.target);
        }
    });

    // Обработчик событий крестиков
    document.querySelector(".calcOma-widget").addEventListener("click", (e) => {
        if (e.target.classList.contains("clear-btn")) {
            const input = e.target.previousElementSibling;
            input.value = "";
            input.click();
            input.focus();
        }
        // Обработчик клика - сохраняем старый фактор
        if (e.target.classList.contains("factor")) {
            e.target.dataset.oldFactor = e.target.value;
        }
    });

    // Обработчик изменения фактора - пересчитываем
    document.querySelector(".calcOma-widget").addEventListener("change", (e) => {
        if (e.target.classList.contains("factor")) {
            const select = e.target;
            const input = select.previousElementSibling.querySelector(".value");
            const value_old = input.value;
            const factor_old = select.dataset.oldFactor;
            const factor_new = select.value;
            if (value_old > 0 && factor_old) {
                input.value = crutchBigjs(crutchBigjs(value_old, factor_old, "*"), factor_new, "/");
            }
        }
    });

    // Функция для изменения цвета поля и обновления массива
    function changeFieldColor(input) {
        // При клике - только логика выделения, без проверки на пустое значение

        // Если поле уже выделено - обновляем порядок
        if (input.classList.contains("changed")) {
            changedFields = changedFields.filter((f) => f !== input);
            changedFields.push(input);
            return;
        }

        // Добавляем новое выделение
        input.classList.add("changed");
        changedFields.push(input);

        // Если больше 2 полей - снимаем самое старое
        if (changedFields.length > 2) {
            const oldestField = changedFields.shift();
            oldestField.classList.remove("changed");
        }
    }

    // Проверка на пустое значение ТОЛЬКО при потере фокуса
    function handleFieldBlur() {
        if (!this.value) {
            this.classList.remove("changed");
            changedFields = changedFields.filter((f) => f !== this);
        }
    }

    // Назначаем обработчики
    fields.forEach((field) => {
        field.addEventListener("blur", handleFieldBlur); // проверка при потере фокуса
        field.addEventListener("click", function () {
            changeFieldColor(this); // выделение при клике
        });
    });

    function calculated() {
        if (changedFields.length === 2) {
            let combination = "";
            let combinationValue = [];
            let positionsToBeCalculated = [];

            fields.forEach((field, num) => {
                if (field.classList.contains("changed")) {
                    combination += "1";
                    combinationValue.push(
                        new Big(field.value).times(field.parentElement.nextElementSibling.value).toString() // Значение * делитель
                    );
                } else {
                    combination += "0";
                    positionsToBeCalculated.push(num);
                }
            });

            // Функция для установки вычисленных значений с учетом делителя
            const setCalculatedValues = (calculatedValues) => {
                calculatedValues.forEach((val, index) => {
                    const field = fields[positionsToBeCalculated[index]];
                    const value = crutchBigjs(val, field.parentElement.nextElementSibling.value, "/");
                    field.value = crutchBigjs(value, Math.max(16 - Math.floor(value).toString().length, 0), "round");
                });
            };

            let I, U, R, P;
            switch (combination) {
                case "1100": // Известны ток и напряжение
                    [I, U] = combinationValue;
                    R = crutchBigjs(U, I, "/");
                    P = crutchBigjs(U, I, "*");
                    setCalculatedValues([R, P]);
                    break;
                case "1010": // Известны ток и сопротивление
                    [I, R] = combinationValue;
                    U = crutchBigjs(I, R, "*");
                    P = crutchBigjs(U, I, "*");
                    setCalculatedValues([U, P]);
                    break;
                case "1001": // Известны ток и мощность
                    [I, P] = combinationValue;
                    U = crutchBigjs(P, I, "/");
                    R = crutchBigjs(U, I, "/");
                    setCalculatedValues([U, R]);
                    break;
                case "0110": // Известны напряжение и сопротивление
                    [U, R] = combinationValue;
                    I = crutchBigjs(U, R, "/");
                    P = crutchBigjs(U, I, "*");
                    setCalculatedValues([I, P]);
                    break;
                case "0101": // Известны напряжение и мощность
                    [U, P] = combinationValue;
                    I = crutchBigjs(P, U, "/");
                    R = crutchBigjs(U, I, "/");
                    setCalculatedValues([I, R]);
                    break;
                case "0011": // Известны сопротивление и мощность
                    [R, P] = combinationValue;
                    I = Math.sqrt(crutchBigjs(P, R, "/"));
                    U = crutchBigjs(I, R, "*");
                    setCalculatedValues([I, U]);
                    break;
                default:
                    console.log("Неизвестная комбинация параметров");
            }
        }
    }

    // Костыли к библиотеке Big.js
    function crutchBigjs(a, b, operator) {
        const operations = {
            "*": (x, y) => x.times(y),
            "/": (x, y) => x.div(y),
            "+": (x, y) => x.plus(y),
            "-": (x, y) => x.minus(y),
            round: (x, y) => x.round(Number(y))
        };
        return operations[operator](new Big(a), b).toFixed();
    }

    ///###################################################
    ///###################################################
    const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwdPMx2MngpAFiv_Uv-4Xz4Yiq4LWIe58ITQbewF_wbITU7QinMUVDkv2A5RVUM8-Am/exec";
    const SPREADSHEET_ID = "1y4_fCqWdzDJcfMHEItXWqxr0ZQKWD8jPz9tRZlVt9K4";
   
async function getIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    return (await response.json()).ip;
  } catch (error) {
    return "unknown_ios_pwa";
  }
}

// Использование
getIP().then(ip => testPost(ip));
    
    
    //fetch("https://api.ipify.org?format=json")
    //    .then((response) => response.json())
    //    .then((data) => {
    //        console.log("IP пользователя:", data.ip);
    //        return testPost(data.ip);
    //    });
    //
    async function testPost(ip) {
        try {
            const response = await fetch(SCRIPT_URL, {
                redirect: "follow",
                method: "POST",
                body: JSON.stringify({
                    id: SPREADSHEET_ID,
                    name: "CALC",
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    ip: ip
                })
            });

            const data = await response.json();
            console.log("✅ Сервер ответил:", data);
            sp = document.querySelector("span.count");
            sp.textContent =
                "." + (data.countAll || "#") + "." + (data.countToday || "#") + "." + (data.countIp || "#");
        } catch (error) {
            console.log("❌ Сервер недоступен:", error);
        }
    }
    document.querySelector("span.ver").textContent = document.documentElement.dataset.version;
    
    ///###################################################
    ///###################################################
});
