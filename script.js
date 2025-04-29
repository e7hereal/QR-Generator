let mode = 1; // Начальный режим

// Проверка на сохраненную тему в localStorage и применение
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Функция для генерации QR-кодов
function generateQRCodes() {
    const textArea = document.getElementById('qrText');
    const qrcodeList = document.getElementById('qrcodeList');
    const text = textArea.value.trim();
    const progressBar = document.getElementById('progressBar');

    qrcodeList.innerHTML = '';

    if (text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const total = lines.length;

        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = '0%';
        progressText.textContent = '0.00%';
        progressBar.style.display = 'block';
        progressBar.style.opacity = 1;

        // Ждём, пока появится с opacity: 1
        setTimeout(() => {
            progressBar.style.opacity = 1;

            // Ещё одна задержка перед началом загрузки
            setTimeout(() => {
                let processed = 0;

                lines.forEach((line) => {
                    const firstPart = line.substring(0, 2);
                    const secondPart = line.substring(3);
                    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=90`;

                    const qrDiv = document.createElement('div');
                    qrDiv.classList.add('qr-item');

                    if (mode === 2) {
                        const downArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        downArrow.setAttribute('class', 'down-arrow');
                        downArrow.setAttribute('viewBox', '-12 8 50 50');
                        downArrow.setAttribute('fill', 'none');
                        downArrow.setAttribute('stroke', 'black');
                        downArrow.setAttribute('stroke-width', '2');
                        downArrow.setAttribute('stroke-linecap', 'round');
                        downArrow.setAttribute('stroke-linejoin', 'round');
                        downArrow.innerHTML = `
                            <rect x="12" y="0" width="11" height="40" fill="black"/>
                            <polygon points="1,40 18,70 36,40" fill="black"/>
                        `;
                        qrDiv.appendChild(downArrow);
                        qrDiv.classList.add('has-arrow');
                    }

                    const caption = document.createElement('div');
                    caption.classList.add('qr-text');
                    caption.innerHTML = `<div class="text-polki">${firstPart}</div><div class="text-polki">${secondPart}</div>`;

                    const img = document.createElement('img');
                    img.src = qrUrl;
                    img.alt = `QR-код для: ${line}`;

                    img.onload = () => {
                        processed++;
                        const percentage = (processed / total) * 100;
                        progressFill.style.width = percentage.toFixed(2) + '%';
                        progressText.textContent = percentage.toFixed(2) + '%';

                        if (processed === total) {
                            setTimeout(() => {
                            progressBar.style.opacity = 0;
                            setTimeout(() => {
                                progressBar.style.display = 'none';
                            }, 500);
                        }, 500);

                        }
                    };

                    qrDiv.appendChild(caption);
                    qrDiv.appendChild(img);

                    qrcodeList.appendChild(qrDiv);
                });
            }, 400); // Задержка перед стартом загрузки
        }, 10); // Задержка для активации transition: opacity
    } else {
        alert('Пожалуйста, введите текст в поле!');
    }
}

// Очистить все
const buttonClearDiv = document.getElementById('clearDivAndTextArea');
buttonClearDiv.addEventListener('click', function () {
document.getElementById('qrcodeList').innerHTML = '';
document.getElementById('qrText').value = '';
});

    // Функция для переключения темы
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme'); // Переключаем класс темной темы

    // Сохраняем выбранную тему в localStorage
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function toggleMode() {
    mode = (mode === 1) ? 2 : 1;
    const modeButton = document.getElementById('modeButton');
    if (mode === 2) {
        modeButton.innerText = 'Убрать стрелки';
    } else {
        modeButton.innerText = 'Добавить стрелки ';
    }
    generateQRCodes(); // Перегенерируем QR-коды с новым режимом
    }

function showDone() {
    const messageElement = document.getElementById('message');
    const qrList = document.getElementById('qrcodeList');

    // Проверяем, есть ли внутри qrcodeList дочерние элементы
    if (qrList.children.length === 0) {
        messageElement.textContent = 'И так пусто';
    } else {
        messageElement.textContent = 'Готово';
    }

    messageElement.classList.add('show');

    setTimeout(function () {
        messageElement.classList.remove('show');
    }, 1000);
}

// Функция для отображения/скрытия инструкции
function toggleInstruction() {
    const instruction = document.getElementById('instruction');
    
    if (instruction.classList.contains('show')) {
        instruction.classList.remove('show');
        setTimeout(() => {
            instruction.style.display = 'none';
        }, 500); // столько же, сколько в transition
    } else {
        instruction.style.display = 'flex'; // сначала показываем
        // небольшая задержка, чтобы сработал transition
        setTimeout(() => {
            instruction.classList.add('show');
        }, 10);
    }
}        

function showInstructionTab(tab) {
    const general = document.getElementById('generalInstructions');
    const printer = document.getElementById('printerInstructions');
    
    // Сначала убираем активный класс с обоих
    general.classList.remove('active');
    printer.classList.remove('active');
    
    // Ждём завершения transition (если хотим полное исчезновение — 400мс)
    setTimeout(() => {
        general.style.display = 'none';
        printer.style.display = 'none';
    
        if (tab === 'general') {
        general.style.display = 'block';
        setTimeout(() => general.classList.add('active'), 10);
        } else {
        printer.style.display = 'block';
        setTimeout(() => printer.classList.add('active'), 10);
        }
    }, 200);
}
