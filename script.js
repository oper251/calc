document.addEventListener("DOMContentLoaded", function () {
	const fields = document.querySelectorAll(".value"); // Находим все поля с данными
	const selectElements = document.querySelectorAll(".factor"); // Находим все поля с данными
	let changedFields = []; // Массив для хранения последних двух измененных полей

	// Обработчик событий полей данных
	fields.forEach((field) => {
		field.addEventListener("input", function () {
			this.value = this.value.replace(",", ".");
			this.value = this.value.replace(/[^.\d]/g, ""); // Удаление недопустимых символов
			this.value = this.value.replace(/^\./, "0."); //Замена ведущей точки на 0.
			const parts = this.value.split("."); // Разделение по точкам - запрет нескольких точек
			if (parts.length > 1) {
				this.value = parts[0] + "." + parts.slice(1).join(""); // Оставляем первую точку, удаляя остальные
			}
			this.value = this.value.replace(/^0+(?=\d)/, ""); // Замена ведущих нулей на один ноль, если необходимо
			this.value = this.value.replace(/^([\d\.]{1,20})?.*/, "$1"); // Запрет ввода более 20 цифр с запятой
			changeFieldColor(this); // Меняем цвет поля
		});
	});

	// Обработчик событий делителей
	selectElements.forEach((select) => {
		let factor_old; // Инициализируем переменную предидущего делителя
		select.addEventListener("click", function () {
			factor_old = select.value; // получаем значение предидущего делителя при клике по select
		});

		select.addEventListener("input", function () {
			// Получаем новое значение делителя
			factor_new = select.value;
			value_old = select.previousElementSibling.value;
			if (value_old > 0) {
				// Не пересчитываем, если ноль или пусто
				//select.previousElementSibling.value = (value_old * factor_old) / factor_new;
				select.previousElementSibling.value = crutchBigjs(
					crutchBigjs(value_old, factor_old, "*"),
					factor_new,
					"/"
				);
				changeFieldColor(this.previousElementSibling);
			}
		});
	});

	// Функция для изменения цвета поля и обновления массива
	function changeFieldColor(input) {
		// Если поле уже в массиве, просто возвращаем
		if (!changedFields.includes(input)) {
			// Добавляем класс выделения к текущему полю
			input.classList.add("changed");

			// Добавляем новое поле в массив
			changedFields.push(input);

			// Если в массиве больше двух полей, удаляем самый старый элемент и убираем класс выделения
			if (changedFields.length > 2) {
				const oldestField = changedFields.shift();
				oldestField.classList.remove("changed");
			}
		}
		if (changedFields.length === 2) {
			let combination = "";
			let combinationValue = [];
			let positionsToBeCalculated = [];

			fields.forEach((field, num) => {
				if (field.classList.contains("changed")) {
					combination += "1";
					combinationValue.push(
						new Big(field.value).times(field.nextElementSibling.value).toString() // Значение * делитель
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
					const value = crutchBigjs(val, field.nextElementSibling.value, "/");
					field.value = crutchBigjs(
						value,
						Math.max(20 - Math.floor(value).toString().length, 0),
						"round"
					);
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
});
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

function onPageLoaded() {
	cl(crutchBigjs("1", "10000000", "/"));
	let factor = Math.pow(10, Math.max(20 - Math.floor(value).toString().length, 1));
	value = Math.round(value * factor) / factor;

	//let valueRight = value.toString().match(/\.\d+?(?=0{3})/) || value.toString().match(/\.\d+/);

	value = Math.floor(value) + valueRight;

	console.log("Тест console.log");
}
function cl(mess, val) {
	if (val === undefined) {
		val = mess;
		mess = "";
	} else {
		mess += "::";
	}

	const time = new Date().toISOString().slice(11, 23);
	let cl = document.getElementById("consoleLog").contentDocument.querySelectorAll("a")[0].innerHTML;
	document.getElementById("consoleLog").contentDocument.querySelectorAll("a")[0].innerHTML =
		time + " >> " + mess + val + "<br>" + cl;
	//time + " >> " + mess + val + "<br>" ;
}
//const iframe = document.getElementById("myFrame");
//// Проверяем, что `iframe` загружен, и обращаемся к его содержимому.
//const link = iframe.contentDocument.querySelectorAll("a")[0];
//link.innerHTML += "<br>" + time + " >> " + mess + val;
