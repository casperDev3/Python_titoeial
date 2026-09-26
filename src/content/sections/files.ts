import type { Section } from "../types";

/** Код Python пишемо через String.raw — бекслеші (\n) лишаються як у Python. */
const py = String.raw;

const section: Section = {
  "slug": "files",
  "title": "Файли та контекст",
  "short": "open, with, pathlib, json",
  "icon": "📜",
  "group": "Надійність",
  "summary": "Читання і запис файлів, режими open, контекстний менеджер with, pathlib, кодування, робота з JSON і CSV.",
  "hero": {
    "name": "Едвард Елрік",
    "universe": "Fullmetal Alchemist",
    "emoji": "⚗️",
    "quote": "Рівноцінний обмін: відкрив файл — закрий файл. with зробить це за тебе.",
    "why": "Алхімія вимагає рівноцінного обміну — як with гарантує, що кожен відкритий ресурс буде закрито."
  },
  "theme": {
    "accent": "#f5b700",
    "accent2": "#c2410c",
    "glow": "#d97706"
  },
  "minutes": 13,
  "order": 12,
  "blocks": [
    // ───────────────────────────── 1. Основи
    { type: "heading", text: "Файли: пам'ять, що переживає програму", id: "basics" },
    {
      type: "text",
      md: "Усе, що живе у змінних, зникає, щойно програма завершилась. Щоб зберегти рекорди гри, налаштування чи звіт — треба записати їх у **файл** на диску.\n\nРобота з файлом завжди складається з трьох кроків, як алхімічна трансмутація:\n\n- **Розуміння** — `open(шлях, режим)` відкриває файл і повертає *файловий об'єкт*.\n- **Розкладання** — читаємо (`read`) або пишемо (`write`) через цей об'єкт.\n- **Перебудова** — `close()` закриває файл: скидає буфер на диск і звільняє ресурс ОС.\n\nФайли бувають **текстові** (Python сам перетворює байти ↔ рядки через кодування) і **бінарні** (сирі байти: картинки, архіви).",
    },
    {
      type: "code",
      title: "Записати й прочитати — «вручну»",
      code: py`f = open("alchemy.txt", "w", encoding="utf-8")
f.write("Рівноцінний обмін\n")
f.write("Щоб отримати, треба віддати\n")
f.close()

f = open("alchemy.txt", encoding="utf-8")
text = f.read()
f.close()

print(text, end="")
print(type(text), len(text.splitlines()), "рядки")`,
      output: py`Рівноцінний обмін
Щоб отримати, треба віддати
<class 'str'> 2 рядки`,
    },
    {
      type: "warning",
      title: "write не додає перенесення рядка",
      md: "На відміну від `print`, метод `f.write(\"текст\")` пише **рівно** те, що ти дав. Забув `\\n` — і всі рядки злипнуться в один. А ще `write` приймає лише рядок: `f.write(42)` дасть `TypeError` — пиши `f.write(str(42))` або `f.write(f\"{42}\\n\")`.",
    },

    // ───────────────────────────── 2. with
    { type: "heading", text: "with — закон рівноцінного обміну", id: "with" },
    {
      type: "text",
      md: "Що буде, якщо між `open` і `close` станеться виняток? `close()` ніколи не викличеться: файл лишиться відкритим, а дані можуть так і не потрапити з буфера на диск. Можна обгорнути все в `try/finally`… але Python має елегантніше рішення — **контекстний менеджер** `with`.\n\n`with open(...) as f:` гарантує: щойно виконання вийде з блоку — *як завгодно*: нормально, через `return` чи через виняток — файл буде закрито. Відкрив → закрив. Рівноцінний обмін.",
    },
    {
      type: "code",
      title: "with закриває файл автоматично",
      code: py`with open("alchemy.txt", "w", encoding="utf-8") as f:
    f.write("Закон №1: рівноцінний обмін\n")
    print("Всередині with, закрито?", f.closed)

print("Після with, закрито?", f.closed)`,
      output: py`Всередині with, закрито? False
Після with, закрито? True`,
    },
    {
      type: "code",
      title: "…навіть якщо всередині вибухнуло",
      code: py`try:
    with open("log.txt", "w", encoding="utf-8") as f:
        f.write("початок трансмутації\n")
        raise RuntimeError("відскок!")
except RuntimeError as e:
    print("Помилка:", e)

print("Файл закрито?", f.closed)
with open("log.txt", encoding="utf-8") as f:
    print("Збережено:", f.read().strip())`,
      output: py`Помилка: відскок!
Файл закрито? True
Збережено: початок трансмутації`,
    },
    {
      type: "viz",
      id: "with-circle",
      title: "3D: трансмутаційне коло with",
      caption: "Файл — це ресурс, який ти «позичаєш» в операційної системи. Увійди в `with`, попрацюй із файлом, а потім вийди нормально або кинь виняток — коло *завжди* викличе `__exit__` і поверне ресурс. Перемкнись на «без with» і кинь виняток: файл лишиться відкритим і «протікатиме» 🔥.",
    },
    {
      type: "compare",
      title: "Відкрити файл",
      bad: {
        label: "Без with",
        code: py`f = open("data.txt", encoding="utf-8")
data = f.read()
process(data)  # 💥 виняток → close() не викличеться
f.close()`,
      },
      good: {
        label: "З with",
        code: py`with open("data.txt", encoding="utf-8") as f:
    data = f.read()
process(data)  # файл уже закритий, помилка тут не страшна`,
      },
      note: "Правило: **завжди** відкривай файли через `with`. І тримай блок коротким — прочитав дані, вийшов, а обробку роби вже поза ним.",
    },
    {
      type: "joke",
      md: "Ал питає, чому я завжди пишу `with`. Бо востаннє, коли я забув закрити ресурс, я втратив ногу, а він — усе тіло. Відтоді — тільки рівноцінний обмін. 🦾",
    },

    // ───────────────────────────── 3. Режими
    { type: "heading", text: "Режими open: r, w, a, x, b, +", id: "modes" },
    {
      type: "text",
      md: "Другий аргумент `open` — **режим**. Він визначає, що можна робити з файлом і що станеться з його вмістом. Помилитися тут дорого: `\"w\"` *миттєво стирає* файл, ще до першого `write`.",
    },
    {
      type: "table",
      head: ["Режим", "Дія", "Якщо файлу немає", "Якщо файл є"],
      rows: [
        ["`\"r\"`", "читання (за замовчуванням)", "`FileNotFoundError`", "курсор на початку"],
        ["`\"w\"`", "запис", "створює", "**стирає** вміст!"],
        ["`\"a\"`", "дописування в кінець", "створює", "пише після наявного"],
        ["`\"x\"`", "ексклюзивне створення", "створює", "`FileExistsError`"],
        ["`\"r+\"`", "читання + запис", "`FileNotFoundError`", "пише поверх з місця курсора"],
        ["`\"b\"`", "додаток: бінарний режим (`\"rb\"`, `\"wb\"`)", "—", "працюємо з `bytes`, не `str`"],
      ],
    },
    {
      type: "viz",
      id: "open-modes",
      title: "Лабораторія режимів open",
      caption: "Обери режим, вирішуй, чи існує файл, і натисни «Виконати». Побачиш, що станеться з вмістом до і після, де опиниться курсор і яка помилка може вилетіти.",
    },
    {
      type: "code",
      title: "a — дописати, x — лише створити",
      code: py`with open("journal.txt", "w", encoding="utf-8") as f:
    f.write("День 1: шукаю філософський камінь\n")

with open("journal.txt", "a", encoding="utf-8") as f:
    f.write("День 2: Ал знову в броні\n")

with open("journal.txt", encoding="utf-8") as f:
    print(f.read(), end="")

try:
    with open("journal.txt", "x", encoding="utf-8") as f:
        f.write("перезапис?")
except FileExistsError:
    print("x-режим: файл уже існує, не чіпаю!")`,
      output: py`День 1: шукаю філософський камінь
День 2: Ал знову в броні
x-режим: файл уже існує, не чіпаю!`,
    },
    {
      type: "tip",
      title: "Режим \"x\" — захист від випадкового перезапису",
      md: "Зберігаєш звіт і боїшся затерти вчорашній? Відкривай через `\"x\"`: якщо файл уже є, отримаєш `FileExistsError` замість тихої втрати даних.",
    },

    // ───────────────────────────── 4. Читання і курсор
    { type: "heading", text: "Читання: read, readline, цикл і курсор", id: "reading" },
    {
      type: "text",
      md: "У відкритого файлу є **курсор** — позиція, з якої відбудеться наступне читання чи запис. Кожне читання *зсуває* курсор уперед. Тому двічі поспіль `f.read()` дасть весь текст, а потім — порожній рядок.\n\n- `f.read()` — усе до кінця; `f.read(n)` — не більше `n` символів.\n- `f.readline()` — до кінця поточного рядка (разом із `\\n`).\n- `f.readlines()` — список усіх рядків, що лишились.\n- `for line in f:` — найкращий спосіб: читає по одному рядку, не завантажуючи весь файл у пам'ять.\n- `f.tell()` — де курсор, `f.seek(0)` — повернути на початок.",
    },
    {
      type: "viz",
      id: "file-cursor",
      title: "Курсор файлу під мікроскопом",
      caption: "Тисни `read(3)`, `readline()`, `read()` і `seek(0)` — дивись, куди стрибає курсор і що повертає кожен метод. Зверни увагу на невидимий символ `\\n` у кінці кожного рядка.",
    },
    {
      type: "code",
      title: "Кожне читання рухає курсор",
      code: py`with open("squad.txt", "w", encoding="utf-8") as f:
    f.write("Ед\nАл\nВінрі\nМустанг\n")

with open("squad.txt", encoding="utf-8") as f:
    print(repr(f.read(2)))
    print(repr(f.readline()))
    print(repr(f.readline()))
    print(f.readlines())
    print(repr(f.read()))`,
      output: py`'Ед'
'\n'
'Ал\n'
['Вінрі\n', 'Мустанг\n']
''`,
    },
    {
      type: "code",
      title: "Ідіоматичне читання рядок за рядком",
      code: py`with open("squad.txt", "w", encoding="utf-8") as f:
    f.write("Ед\nАл\n\nВінрі\n")

with open("squad.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        name = line.rstrip("\n")
        if not name:
            continue  # пропускаємо порожні рядки
        print(number, name)`,
      output: py`1 Ед
2 Ал
4 Вінрі`,
    },
    {
      type: "code",
      title: "tell і seek",
      code: py`with open("seal.txt", "w", encoding="utf-8") as f:
    f.write("ABCDEF")

with open("seal.txt", encoding="utf-8") as f:
    print(f.read(3), f.tell())
    print(f.read(), f.tell())
    f.seek(0)
    print(f.read(1))`,
      output: py`ABC 3
DEF 6
A`,
    },
    {
      type: "tip",
      title: "Великі файли — тільки циклом",
      md: "`f.read()` на лог у 5 ГБ спробує вмістити все в оперативну пам'ять. `for line in f:` читає по рядку і працює з файлом будь-якого розміру. А швидко порахувати рядки можна так: `sum(1 for _ in f)`.",
    },
    {
      type: "warning",
      title: "tell() у текстовому режимі — не номер символу",
      md: "У UTF-8 кирилична літера займає 2 байти, тому `tell()` повертає «непрозору» позицію, а не кількість символів. Використовуй `seek()` лише з `0` або з числами, які раніше повернув `tell()`. Для точного позиціювання працюй у бінарному режимі `\"rb\"`.",
    },

    // ───────────────────────────── 5. Запис
    { type: "heading", text: "Запис: write, writelines, print(file=)", id: "writing" },
    {
      type: "code",
      title: "Три способи записати",
      code: py`elements = ["Вуглець", "Азот", "Кисень"]

with open("elements.txt", "w", encoding="utf-8") as f:
    f.write("# Склад людини\n")
    f.writelines(e + "\n" for e in elements)
    print("Разом:", len(elements), "елементи", file=f)

with open("elements.txt", encoding="utf-8") as f:
    print(f.read(), end="")`,
      output: py`# Склад людини
Вуглець
Азот
Кисень
Разом: 3 елементи`,
    },
    {
      type: "tip",
      title: "print(..., file=f) — найзручніший запис",
      md: "`print` сам додає пробіли між аргументами, `\\n` у кінці й перетворює числа на рядки. Тому `print(name, score, sep=\";\", file=f)` часто зручніший за ручне склеювання рядка для `write`.",
    },

    // ───────────────────────────── 6. Кодування
    { type: "heading", text: "Кодування: чому завжди encoding=\"utf-8\"", id: "encoding" },
    {
      type: "text",
      md: "Диск зберігає **байти**, а ми працюємо з **рядками**. Правило перетворення — **кодування**. Сучасний стандарт — UTF-8: латиниця займає 1 байт, кирилиця — 2, емодзі — 4.\n\nЯкщо не вказати `encoding`, Python візьме кодування системи за замовчуванням — а на Windows це досі може бути `cp1251` чи `cp1252`. Файл, записаний на Mac, відкриється на Windows «кракозябрами» або з `UnicodeDecodeError`. Тому **завжди** пиши `encoding=\"utf-8\"` у текстовому режимі.",
    },
    {
      type: "code",
      title: "Символи ≠ байти",
      code: py`text = "Сталевий алхімік"
data = text.encode("utf-8")
print(len(text), "символів")
print(len(data), "байт")
print(data[:6])
print(data[:6].decode("utf-8"))

with open("name.txt", "w", encoding="utf-8") as f:
    f.write(text)

try:
    with open("name.txt", encoding="ascii") as f:
        f.read()
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e.reason)`,
      output: py`16 символів
31 байт
b'\xd0\xa1\xd1\x82\xd0\xb0'
Ста
UnicodeDecodeError: ordinal not in range(128)`,
    },
    {
      type: "code",
      title: "Бінарний режим: сирі байти",
      code: py`with open("circle.bin", "wb") as f:
    f.write(bytes([0, 255, 16, 32]))
    f.write("Ед".encode("utf-8"))

with open("circle.bin", "rb") as f:
    raw = f.read()

print(raw)
print(list(raw))
print(len(raw), "байтів")`,
      output: py`b'\x00\xff\x10 \xd0\x95\xd0\xb4'
[0, 255, 16, 32, 208, 149, 208, 180]
8 байтів`,
    },
    {
      type: "tip",
      title: "Excel і BOM",
      md: "Excel на Windows інколи неправильно відкриває CSV у чистому UTF-8. Запиши файл з `encoding=\"utf-8-sig\"` — він додасть невидимий маркер BOM, і кирилиця відобразиться правильно. А при *читанні* `utf-8-sig` прибере цей маркер, якщо він є.",
    },
    {
      type: "quiz",
      question: "Що буде з уже наявним файлом `report.txt` після рядка `open(\"report.txt\", \"w\")`, навіть якщо ти нічого в нього не записав?",
      options: ["Нічого, вміст збережеться", "Файл стане порожнім", "Виникне `FileExistsError`", "Курсор переміститься в кінець"],
      answer: 1,
      explain: "Режим `\"w\"` обрізає файл до нуля **в момент відкриття**. Для дописування використовуй `\"a\"`, а для захисту від перезапису — `\"x\"`.",
    },

    // ───────────────────────────── 7. pathlib
    { type: "heading", text: "pathlib — шляхи як об'єкти", id: "pathlib" },
    {
      type: "text",
      md: "Склеювати шляхи рядками (`\"data\" + \"/\" + name`) — шлях до болю: на Windows роздільник `\\`, десь забудеш слеш, десь поставиш два. Модуль `pathlib` дає клас `Path`, з яким шляхи — це об'єкти:\n\n- `Path(\"lab\") / \"notes\" / \"a.txt\"` — оператор `/` склеює частини правильно для будь-якої ОС.\n- `.name`, `.stem`, `.suffix`, `.parent` — частини шляху.\n- `.exists()`, `.is_file()`, `.is_dir()` — перевірки.\n- `.read_text()` / `.write_text()` — прочитати/записати файл *одним рядком* (відкриття і закриття всередині).\n- `.mkdir(parents=True, exist_ok=True)`, `.glob(\"*.txt\")`, `.iterdir()` — робота з теками.",
    },
    {
      type: "viz",
      id: "path-tree",
      title: "3D: дерево тек лабораторії",
      caption: "Покрути лабораторію й натисни на будь-яку теку чи файл — побачиш, як `pathlib` розбирає шлях на частини: `name`, `stem`, `suffix`, `parent`, `parts`. Шлях від кореня до обраного вузла підсвічується — це і є ланцюжок операторів `/`.",
    },
    {
      type: "code",
      title: "Path у дії",
      code: py`from pathlib import Path

notes = Path("lab") / "notes" / "transmutation.txt"
print(notes)
print(notes.name, "|", notes.stem, "|", notes.suffix)
print(notes.parent, notes.parts)

notes.parent.mkdir(parents=True, exist_ok=True)
notes.write_text("Коло + символи = трансмутація", encoding="utf-8")

print(notes.exists(), notes.is_file(), notes.parent.is_dir())
print(notes.read_text(encoding="utf-8"))
print(notes.with_suffix(".md").name)`,
      output: py`lab/notes/transmutation.txt
transmutation.txt | transmutation | .txt
lab/notes ('lab', 'notes', 'transmutation.txt')
True True True
Коло + символи = трансмутація
transmutation.md`,
    },
    {
      type: "code",
      title: "Пошук файлів за шаблоном",
      code: py`from pathlib import Path

lab = Path("lab2")
lab.mkdir(exist_ok=True)
for name in ["fire.txt", "water.txt", "array.png", "notes.TXT"]:
    (lab / name).write_text("...", encoding="utf-8")

print(sorted(p.name for p in lab.glob("*.txt")))
print(sorted(p.name for p in lab.iterdir() if p.suffix.lower() == ".txt"))
print(sum(p.stat().st_size for p in lab.iterdir()), "байтів разом")`,
      output: py`['fire.txt', 'water.txt']
['fire.txt', 'notes.TXT', 'water.txt']
12 байтів разом`,
    },
    {
      type: "tip",
      title: "Шлях відносно скрипта, а не терміналу",
      md: "Відносний шлях `\"data.txt\"` рахується від **поточної робочої теки** (звідки запустили програму), а не від теки зі скриптом. Щоб завжди знаходити файл поруч зі скриптом: `BASE = Path(__file__).resolve().parent`, а потім `BASE / \"data.txt\"`.",
    },
    {
      type: "joke",
      hero: "Альфонс Елрік",
      md: "Брате, ти знову написав `\"D:\\Ed\\new.txt\"` без `r` перед рядком, і `\\n` перетворилось на перенесення рядка! (А з `\"C:\\Users\"` Python узагалі не запуститься: `\\U` — початок Unicode-escape, і це `SyntaxError`.) Використовуй `Path` — він не зламається, навіть якщо я знову опинюсь в обладунках. 🛡️",
    },

    // ───────────────────────────── 8. JSON
    { type: "heading", text: "JSON — універсальна мова даних", id: "json" },
    {
      type: "text",
      md: "**JSON** — текстовий формат, який розуміють усі: браузери, API, конфіги, інші мови. Модуль `json` перетворює Python-об'єкти на JSON-рядок і назад:\n\n- `json.dumps(obj)` → рядок; `json.loads(s)` → об'єкт.\n- `json.dump(obj, f)` → одразу у файл; `json.load(f)` → з файлу. (Запам'ятай: **s** на кінці = **s**tring.)\n\nАле обмін не зовсім рівноцінний: кортеж стає списком, ключі-числа — рядками, а `set` чи `datetime` взагалі не серіалізуються без допомоги.",
    },
    {
      type: "viz",
      id: "json-bridge",
      title: "Міст Python ⇄ JSON",
      caption: "Натискай поля ліворуч — побачиш, у що кожне перетворюється в JSON. Потім натисни «Туди й назад» (`loads(dumps(x))`) і подивись, які значення повернулись *іншими*. Спробуй додати `set` — і отримаєш `TypeError`.",
    },
    {
      type: "code",
      title: "dumps / loads і пастки перетворення",
      code: py`import json

hero = {
    "name": "Едвард Елрік",
    "age": 15,
    "automail": True,
    "brother": None,
    "skills": ("алхімія", "бій"),
    1: "ключ-число",
}

text = json.dumps(hero, ensure_ascii=False)
print(text)

back = json.loads(text)
print(back["skills"], back["brother"], back["1"])
print(back == hero)`,
      output: py`{"name": "Едвард Елрік", "age": 15, "automail": true, "brother": null, "skills": ["алхімія", "бій"], "1": "ключ-число"}
['алхімія', 'бій'] None ключ-число
False`,
    },
    {
      type: "code",
      title: "Зберегти гру у файл і завантажити",
      code: py`import json
from pathlib import Path

state = {"level": 7, "inventory": ["крейда", "кільце"], "hp": 92.5}
path = Path("save.json")

with path.open("w", encoding="utf-8") as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

print(path.read_text(encoding="utf-8"))

with path.open(encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded["inventory"][1], loaded == state)`,
      output: py`{
  "level": 7,
  "inventory": [
    "крейда",
    "кільце"
  ],
  "hp": 92.5
}
кільце True`,
    },
    {
      type: "tip",
      title: "ensure_ascii=False та indent=2",
      md: "Без `ensure_ascii=False` кирилиця збережеться як `\\u0415\\u0434` — валідно, але нечитабельно. `indent=2` робить файл зручним для людей і для `git diff`. Для нестандартних типів передай `default=str`: `json.dumps(data, default=str)` перетворить, наприклад, `datetime` на рядок.",
    },
    {
      type: "quiz",
      question: "Що поверне `json.loads(json.dumps({\"pos\": (1, 2)}))`?",
      options: ["`{'pos': (1, 2)}`", "`{'pos': [1, 2]}`", "`{'pos': '(1, 2)'}`", "`TypeError`"],
      answer: 1,
      explain: "У JSON немає кортежів — лише масиви. `dumps` запише `(1, 2)` як `[1, 2]`, а `loads` поверне список. Обмін не завжди рівноцінний!",
    },

    // ───────────────────────────── 9. CSV
    { type: "heading", text: "CSV — таблиці в тексті", id: "csv" },
    {
      type: "text",
      md: "**CSV** (comma-separated values) — найпростіший табличний формат: рядок = запис, коми розділяють колонки. Його відкриває Excel, Google Sheets і будь-яка база даних.\n\nНе парси CSV через `line.split(\",\")` — зламається на першому ж значенні з комою всередині (`\"Державний алхімік, майор\"`). Модуль `csv` правильно обробляє лапки, коми й перенесення. Відкривай CSV-файли з `newline=\"\"` — так вимагає документація, інакше на Windows з'являться порожні рядки.",
    },
    {
      type: "code",
      title: "DictWriter і DictReader",
      code: py`import csv

army = [
    {"name": "Ед", "rank": "Державний алхімік, майор", "age": 15},
    {"name": "Рой", "rank": "Полковник", "age": 29},
    {"name": "Різа", "rank": "Лейтенант", "age": 26},
]

with open("army.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "rank", "age"])
    writer.writeheader()
    writer.writerows(army)

with open("army.csv", encoding="utf-8") as f:
    print(f.read(), end="")

with open("army.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(f"{row['name']:<4} | вік через рік: {int(row['age']) + 1}")`,
      output: py`name,rank,age
Ед,"Державний алхімік, майор",15
Рой,Полковник,29
Різа,Лейтенант,26
Ед   | вік через рік: 16
Рой  | вік через рік: 30
Різа | вік через рік: 27`,
    },
    {
      type: "warning",
      title: "CSV повертає тільки рядки",
      md: "`csv.reader` і `DictReader` не вгадують типи: `row[\"age\"]` — це `\"15\"`, а не `15`. Перетворюй явно (`int(...)`, `float(...)`), інакше `row[\"age\"] + 1` дасть `TypeError`, а сортування «за віком» піде за алфавітом (`\"100\" < \"29\"`).",
    },

    // ───────────────────────────── 10. Власні контекстні менеджери
    { type: "heading", text: "Власні контекстні менеджери", id: "context" },
    {
      type: "text",
      md: "`with` працює не лише з файлами: замки, з'єднання з БД, тимчасова зміна налаштувань, таймери. Будь-який об'єкт з методами `__enter__` і `__exit__` — контекстний менеджер:\n\n- `__enter__` викликається на вході; те, що він повертає, потрапляє в змінну після `as`.\n- `__exit__(exc_type, exc, tb)` викликається на виході **завжди**. Якщо був виняток — отримає його дані. Повернув `True` — виняток «проковтнуто», `False`/`None` — летить далі.\n\nЩе простіше — декоратор `@contextmanager`: код до `yield` — це вхід, після — вихід.",
    },
    {
      type: "code",
      title: "Клас з __enter__ і __exit__",
      code: py`class Circle:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"__enter__: коло «{self.name}» активне")
        return self

    def __exit__(self, exc_type, exc, tb):
        kind = exc_type.__name__ if exc_type else None
        print(f"__exit__: коло стерто (виняток: {kind})")
        return False  # не ковтаємо виняток

try:
    with Circle("спис") as c:
        print("  трансмутую", c.name)
        raise ValueError("не той матеріал")
except ValueError as e:
    print("Виняток вийшов назовні:", e)`,
      output: py`__enter__: коло «спис» активне
  трансмутую спис
__exit__: коло стерто (виняток: ValueError)
Виняток вийшов назовні: не той матеріал`,
    },
    {
      type: "code",
      title: "@contextmanager — те саме у 6 рядків",
      code: py`from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        ms = (time.perf_counter() - start) * 1000
        print(f"{label}: {'швидко' if ms < 1000 else 'повільно'}")

with timer("Трансмутація"):
    total = sum(range(100_000))
print(total)`,
      output: py`Трансмутація: швидко
4999950000`,
    },
    {
      type: "code",
      title: "Кілька файлів в одному with",
      code: py`from pathlib import Path

Path("lead.txt").write_text("свинець\nзалізо\nсвинець\n", encoding="utf-8")

with (
    open("lead.txt", encoding="utf-8") as src,
    open("gold.txt", "w", encoding="utf-8") as dst,
):
    for line in src:
        dst.write(line.replace("свинець", "золото"))

print(Path("gold.txt").read_text(encoding="utf-8"), end="")`,
      output: py`золото
залізо
золото`,
    },
    {
      type: "joke",
      hero: "Рой Мустанг",
      md: "Сталевий, твій `with` для кожного файлу — мило. Я ж відкриваю три файли одним `with` у дужках — і клацаю пальцями. 🔥 …Щоправда, під дощем `write` не працює. Шкода.",
    },
    {
      type: "quiz",
      question: "Що станеться, якщо `__exit__` поверне `True`, а в блоці `with` виник виняток?",
      options: [
        "Виняток полетить далі як звичайно",
        "Виняток буде «проковтнуто» — виконання продовжиться після with",
        "Python кине `RuntimeError`",
        "Блок with виконається ще раз",
      ],
      answer: 1,
      explain: "Повернене `True` означає «я обробив виняток». Саме так працює `contextlib.suppress`. Тому повертай `True` лише свідомо, інакше сховаєш справжні помилки.",
    },

    // ───────────────────────────── Шпаргалка
    { type: "text", md: "**Шпаргалка алхіміка** — найчастіші операції з файлами:" },
    {
      type: "table",
      head: ["Задача", "Код"],
      rows: [
        ["Прочитати весь текст", "`Path(p).read_text(encoding=\"utf-8\")`"],
        ["Записати текст", "`Path(p).write_text(s, encoding=\"utf-8\")`"],
        ["Рядок за рядком", "`with open(p, encoding=\"utf-8\") as f: for line in f:`"],
        ["Дописати в кінець", "`open(p, \"a\", encoding=\"utf-8\")`"],
        ["Не перезаписати випадково", "`open(p, \"x\", ...)`"],
        ["Байти", "`open(p, \"rb\")` / `\"wb\"`"],
        ["Склеїти шлях", "`Path(\"dir\") / \"file.txt\"`"],
        ["Створити теки", "`path.mkdir(parents=True, exist_ok=True)`"],
        ["Знайти файли", "`Path(\".\").glob(\"**/*.py\")`"],
        ["JSON у файл / з файлу", "`json.dump(obj, f, ensure_ascii=False, indent=2)` / `json.load(f)`"],
        ["CSV", "`csv.DictWriter(f, fieldnames=[...])`, `csv.DictReader(f)` + `newline=\"\"`"],
      ],
    },
    {
      type: "joke",
      md: "Людство не може нічого отримати, не віддавши щось натомість. Програма не може відкрити файл, не закривши його. Це і є перший закон алхімії… і `with`. ⚗️✨",
    },
  ]
};

export default section;
