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
				select.previousElementSibling.value = (value_old * factor_old) / factor_new;
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
					const value = parseFloat(field.value) * parseFloat(field.nextElementSibling.value); // Учитываем делитель для известных параметров
					combination += "1";
					combinationValue.push(value);
				} else {
					combination += "0";
					positionsToBeCalculated.push(num);
				}
			});

			// Функция для установки значений с учетом делителя
			const setCalculatedValues = (calculatedValues) => {
				calculatedValues.forEach((val, index) => {
					const field = fields[positionsToBeCalculated[index]];
					const divider = parseFloat(field.nextElementSibling.value); // Получаем делитель
					field.value = val / divider; // Применяем делитель к результату
				});
			};

			let I, U, R, P;
			switch (combination) {
				case "1100": // Известны ток и напряжение
					[I, U] = combinationValue;
					R = U / I;
					P = U * I;
					setCalculatedValues([R, P]);
					break;
				case "1010": // Известны ток и сопротивление
					[I, R] = combinationValue;
					U = I * R;
					P = U * I;
					setCalculatedValues([U, P]);
					break;
				case "1001": // Известны ток и мощность
					[I, P] = combinationValue;
					U = P / I;
					R = U / I;
					setCalculatedValues([U, R]);
					break;
				case "0110": // Известны напряжение и сопротивление
					[U, R] = combinationValue;
					I = U / R;
					P = U * I;
					setCalculatedValues([I, P]);
					break;
				case "0101": // Известны напряжение и мощность
					[U, P] = combinationValue;
					I = P / U;
					R = U / I;
					setCalculatedValues([I, R]);
					break;
				case "0011": // Известны сопротивление и мощность
					[R, P] = combinationValue;
					I = Math.sqrt(P / R);
					U = I * R;
					setCalculatedValues([I, U]);
					break;
				default:
					console.log("Неизвестная комбинация параметров");
			}
		}
	}
});

function onPageLoaded() {
	console.log("Тест console.log");
	document.addEventListener("DOMContentLoaded", function () {
		const styleSheet = document.querySelector("style").innerHTML;
		document.querySelector("style").innerHTML = styleSheet + " /* " + Date.now() + " */";
	});
}
window.onload = function () {
	document.getElementById("screen-size").textContent = Date.now();

	// Здесь сообщение будет показано только для пользователей Internet Explorer, а другие браузеры его не увидят.
	if (navigator1.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > -1) {
		document.getElementById("screen-size").innerHTML +=
			'<p>You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>';
	}
};
