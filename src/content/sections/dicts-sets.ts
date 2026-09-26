import type { Section } from "../types";

const section: Section = {
  "slug": "dicts-sets",
  "title": "Словники та множини",
  "short": "dict, set, хешування",
  "icon": "🗝️",
  "group": "Колекції",
  "summary": "Словники: ключі, значення, методи, обхід, get/setdefault, як працює хеш-таблиця. Множини та операції над ними.",
  "hero": {
    "name": "Сатору Ґоджьо",
    "universe": "Jujutsu Kaisen",
    "emoji": "🕶️",
    "quote": "Доступ за ключем — O(1). Нескінченність тут ні до чого.",
    "why": "Ґоджьо миттєво знаходить ціль — як словник знаходить значення за хешем ключа."
  },
  "theme": {
    "accent": "#0284c7",
    "accent2": "#a78bfa",
    "glow": "#0ea5e9"
  },
  "minutes": 15,
  "order": 8,
  "blocks": [
    // ───────────────────────── 1. Словник
    { type: "heading", text: "Словник: знайти ціль за ключем" },
    {
      type: "text",
      md: `У списку елемент шукають за **номером**. Але в житті ми частіше шукаємо за **назвою**: телефон — за ім'ям, ціну — за товаром, рівень прокляття — за ім'ям чаклуна. Для цього є **словник** (\`dict\`) — колекція пар **ключ → значення**.

- ключі **унікальні**: другий запис з тим самим ключем перезапише перший;
- ключ має бути **хешованим** (незмінним): рядок, число, кортеж — так; список — ні;
- значення можуть бути будь-якими;
- з Python 3.7 словник **пам'ятає порядок** додавання.

А найголовніше — пошук за ключем майже миттєвий, **O(1)**, скільки б записів не було. Як Ґоджьо, який не перебирає всіх ворогів по черзі, а одразу опиняється поруч з потрібним.`,
    },
    {
      type: "code",
      title: "dict_basics.py",
      code: `sorcerer = {
    "name": "Satoru Gojo",
    "grade": "special",
    "age": 28,
    "techniques": ["Limitless", "Six Eyes"],
}

print(sorcerer["name"])           # доступ за ключем
print(sorcerer["techniques"][0])
print(len(sorcerer))              # кількість пар
print("age" in sorcerer)          # in перевіряє КЛЮЧІ
print(28 in sorcerer)             # значення так не шукають`,
      output: `Satoru Gojo
Limitless
4
True
False`,
    },
    {
      type: "code",
      title: "dict_create.py",
      code: `empty = {}                                   # порожній словник
grades = dict(yuji=1, megumi=2, nobara=3)    # через dict(...)
pairs = dict([("sukuna", 20), ("mahito", 1)])  # зі списку пар
keys = dict.fromkeys(["hp", "ce"], 0)        # однакове значення

print(empty, type(empty))
print(grades)
print(pairs)
print(keys)
print(dict(zip(["a", "b"], [1, 2])))         # два списки → словник`,
      output: `{} <class 'dict'>
{'yuji': 1, 'megumi': 2, 'nobara': 3}
{'sukuna': 20, 'mahito': 1}
{'hp': 0, 'ce': 0}
{'a': 1, 'b': 2}`,
    },
    {
      type: "warning",
      title: "KeyError",
      md: `Звернення до ключа, якого немає, — \`grades["gojo"]\` — кидає \`KeyError: 'gojo'\`. Це найчастіша помилка зі словниками. Якщо ключа може не бути, використовуй \`in\` або метод \`.get()\` (про нього — нижче).`,
    },
    {
      type: "joke",
      md: `Мене питають, чи не важко знаходити ворогів серед мільйона проклять. Ні. У мене ж \`curses[name]\` — O(1). Перебирати список — це для тих, у кого немає Шести Очей.`,
    },

    // ───────────────────────── 2. Зміна словника
    { type: "heading", text: "Додаємо, змінюємо, видаляємо" },
    {
      type: "text",
      md: `Словник змінюваний. Запис \`d[key] = value\` **додає** нову пару, якщо ключа немає, або **перезаписує** значення, якщо є. Для видалення:

- \`del d[key]\` — просто видалити (KeyError, якщо немає);
- \`d.pop(key, default)\` — видалити і **повернути** значення; з \`default\` помилки не буде;
- \`d.popitem()\` — вийняти **останню додану** пару;
- \`d.update(other)\` або \`d |= other\` — злити інший словник (з перезаписом збігів).

Прогорни візуалізацію: вона покроково виконує операції й показує, що саме відбувається зі словником.`,
    },
    {
      type: "viz",
      id: "dict-ops",
      title: "Покрокові операції зі словником",
      caption: `Натискай «Крок», щоб виконувати рядки по одному. Зелене — нова пара, фіолетове — перезаписане значення, червоне — видалене. Зверни увагу: при перезаписі ключ **залишається на своєму місці** в порядку.`,
    },
    {
      type: "code",
      title: "dict_edit.py",
      code: `team = {"Yuji": 1, "Megumi": 2}

team["Nobara"] = 3          # нова пара
team["Yuji"] = 100          # перезапис значення
print(team)

hp = team.pop("Megumi")     # вийняти і повернути
print(hp, team)
print(team.pop("Toji", "немає"))   # default замість KeyError

team.update({"Maki": 4, "Yuji": 1})
print(team)
del team["Maki"]
print(team.popitem())       # остання додана пара
print(team)`,
      output: `{'Yuji': 100, 'Megumi': 2, 'Nobara': 3}
2 {'Yuji': 100, 'Nobara': 3}
немає
{'Yuji': 1, 'Nobara': 3, 'Maki': 4}
('Nobara', 3)
{'Yuji': 1}`,
    },
    {
      type: "code",
      title: "dict_merge.py",
      code: `defaults = {"domain": "none", "speed": 1, "blindfold": True}
gojo = {"domain": "Infinite Void", "speed": 99}

merged = defaults | gojo        # Python 3.9+: новий словник
print(merged)

unpacked = {**defaults, **gojo} # старий спосіб, той самий результат
print(unpacked == merged)`,
      output: `{'domain': 'Infinite Void', 'speed': 99, 'blindfold': True}
True`,
    },
    {
      type: "tip",
      title: "Праве перемагає",
      md: `При злитті \`a | b\`, \`{**a, **b}\` чи \`a.update(b)\` для однакових ключів **виграє правий** словник. Тому ставлять спочатку налаштування за замовчуванням, а потім — користувацькі: \`config = defaults | user_settings\`.`,
    },

    // ───────────────────────── 3. get / setdefault
    { type: "heading", text: "get, setdefault і друзі: без KeyError" },
    {
      type: "text",
      md: `Три інструменти, які роблять код зі словниками коротким і безпечним:

- \`d.get(key, default)\` — повертає значення або \`default\` (за замовчуванням \`None\`), **ніколи** не кидає KeyError і нічого не додає;
- \`d.setdefault(key, default)\` — якщо ключа немає, **додає** його з \`default\`, а потім повертає значення;
- \`collections.Counter\` і \`collections.defaultdict\` — готові словники для підрахунку та групування.`,
    },
    {
      type: "code",
      title: "get_setdefault.py",
      code: `grades = {"Yuji": 1, "Megumi": 2}

print(grades.get("Yuji"))          # є — повертає значення
print(grades.get("Toji"))          # немає — None
print(grades.get("Toji", "не чаклун"))
print(grades)                      # get нічого не додав

grades.setdefault("Nobara", 3)     # додає, бо ключа немає
grades.setdefault("Yuji", 999)     # ключ є — нічого не змінює
print(grades)`,
      output: `1
None
не чаклун
{'Yuji': 1, 'Megumi': 2}
{'Yuji': 1, 'Megumi': 2, 'Nobara': 3}`,
    },
    {
      type: "compare",
      title: "Підрахунок входжень",
      bad: {
        label: "перевірка на кожному кроці",
        code: `text = "gojo gojo sukuna gojo yuji"
counts = {}
for word in text.split():
    if word in counts:
        counts[word] = counts[word] + 1
    else:
        counts[word] = 1`,
      },
      good: {
        label: "get з default — один рядок",
        code: `text = "gojo gojo sukuna gojo yuji"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
# {'gojo': 3, 'sukuna': 1, 'yuji': 1}`,
      },
      note: `А ще краще — \`Counter(text.split())\`: він зробить те саме і дасть метод \`most_common()\`.`,
    },
    {
      type: "flow",
      title: "Підрахунок слів через get",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "init", kind: "process", label: "counts = {}", col: 0, row: 1 },
        { id: "loop", kind: "decision", label: "for w in words:\nє ще w?", col: 0, row: 2 },
        { id: "out", kind: "io", label: "print(counts)", col: 1, row: 2 },
        { id: "e", kind: "end", label: "Кінець", col: 1, row: 3 },
        { id: "get", kind: "call", label: "c = counts.get(w, 0)", col: 0, row: 3 },
        { id: "set", kind: "process", label: "counts[w] = c + 1", col: 0, row: 4 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "loop" },
        { from: "loop", to: "get", label: "так" },
        { from: "loop", to: "out", label: "ні" },
        { from: "out", to: "e" },
        { from: "get", to: "set" },
        { from: "set", to: "loop", side: "left" },
      ],
      scenarios: [
        {
          name: "words = [\"gojo\", \"sukuna\", \"gojo\"]",
          steps: [
            { node: "s" },
            { node: "init", note: "`counts = {}`" },
            { node: "loop", note: "`w = 'gojo'`" },
            { node: "get", note: "ключа немає → `c = 0` (default)" },
            { node: "set", note: "`counts = {'gojo': 1}`" },
            { node: "loop", note: "`w = 'sukuna'`" },
            { node: "get", note: "ключа немає → `c = 0`" },
            { node: "set", note: "`counts = {'gojo': 1, 'sukuna': 1}`" },
            { node: "loop", note: "`w = 'gojo'`" },
            { node: "get", note: "ключ є → `c = 1`" },
            { node: "set", note: "`counts = {'gojo': 2, 'sukuna': 1}`" },
            { node: "loop", note: "слова закінчились" },
            { node: "out", note: "вивід: `{'gojo': 2, 'sukuna': 1}`" },
            { node: "e" },
          ],
        },
      ],
      caption: "`get` із default прибирає гілку `if w in counts`: для нового слова він повертає `0`, для відомого — поточний лічильник.",
    },
    {
      type: "code",
      title: "counter_defaultdict.py",
      code: `from collections import Counter, defaultdict

words = "gojo gojo sukuna gojo yuji sukuna".split()
c = Counter(words)
print(c)
print(c.most_common(1))
print(c["megumi"])            # відсутній ключ — 0, без KeyError

by_grade = defaultdict(list)  # відсутній ключ → порожній список
for name, grade in [("Yuji", 1), ("Maki", 4), ("Megumi", 2), ("Nobara", 3), ("Todo", 1)]:
    by_grade[grade].append(name)
print(dict(by_grade))`,
      output: `Counter({'gojo': 3, 'sukuna': 2, 'yuji': 1})
[('gojo', 3)]
0
{1: ['Yuji', 'Todo'], 4: ['Maki'], 2: ['Megumi'], 3: ['Nobara']}`,
    },
    {
      type: "tip",
      title: "setdefault для групування",
      md: `Без імпортів групувати можна так: \`groups.setdefault(key, []).append(item)\`. Один рядок замість \`if key not in groups: groups[key] = []\`. Але якщо групуєш багато — \`defaultdict(list)\` читається ще простіше.`,
    },
    {
      type: "quiz",
      question: "Що виведе `d = {}; d.get(\"x\", 5); print(d)`?",
      options: ["{'x': 5}", "{}", "5", "KeyError"],
      answer: 1,
      explain: "`get` лише **читає**: повертає `5`, але нічого в словник не записує. Додає ключ `setdefault`, а не `get`.",
    },

    // ───────────────────────── 4. Обхід
    { type: "heading", text: "Обхід словника" },
    {
      type: "text",
      md: `Цикл \`for key in d\` іде по **ключах**. Для інших варіантів є «представлення» (views):

- \`d.keys()\` — ключі;
- \`d.values()\` — значення;
- \`d.items()\` — пари \`(ключ, значення)\`, які зручно одразу розпакувати.

Views — «живі»: вони завжди показують актуальний стан словника, не копіюючи його.`,
    },
    {
      type: "code",
      title: "iterate.py",
      code: `power = {"Gojo": 100, "Sukuna": 99, "Yuta": 90}

for name in power:                    # по ключах
    print(name)

print(list(power.values()))
print(sum(power.values()))

for name, lvl in power.items():       # ключ + значення
    print(f"{name:<7}{'█' * (lvl // 20)} {lvl}")

strongest = max(power, key=power.get) # ключ з найбільшим значенням
print(strongest)`,
      output: `Gojo
Sukuna
Yuta
[100, 99, 90]
289
Gojo   █████ 100
Sukuna ████ 99
Yuta   ████ 90
Gojo`,
    },
    {
      type: "warning",
      title: "Не змінюй розмір під час обходу",
      md: `Додавати або видаляти ключі прямо всередині \`for k in d\` не можна — отримаєш \`RuntimeError: dictionary changed size during iteration\`. Обходь копію ключів: \`for k in list(d):\` — або збери новий словник через comprehension.`,
    },
    {
      type: "code",
      title: "safe_delete.py",
      code: `curses = {"Mahito": 1, "Jogo": 1, "Hanami": 1, "Choso": 0}

for name in list(curses):        # list(...) — знімок ключів
    if curses[name] == 1:
        del curses[name]
print(curses)

# або одразу новий словник
power = {"Gojo": 100, "Yuji": 60, "Megumi": 70}
elite = {k: v for k, v in power.items() if v >= 70}
print(elite)`,
      output: `{'Choso': 0}
{'Gojo': 100, 'Megumi': 70}`,
    },

    // ───────────────────────── 5. Хеш-таблиця
    { type: "heading", text: "Як працює хеш-таблиця" },
    {
      type: "text",
      md: `Чому словник знаходить ключ миттєво? Під капотом — **хеш-таблиця**: масив «комірок» (слотів).

- Для ключа рахується \`hash(key)\` — велике ціле число, «відбиток» ключа.
- Номер комірки = \`hash % розмір_таблиці\`. Туди й кладеться пара.
- Щоб знайти ключ, Python знову рахує хеш і **одразу** йде в потрібну комірку — не перебираючи інші.
- Якщо комірка зайнята іншим ключем (**колізія**), Python пробує наступні комірки за певним правилом (відкрита адресація).
- Коли таблиця заповнюється приблизно на 2/3, вона **збільшується**, і всі ключі перерозкладаються.

Звідси головне правило: ключ **не може змінюватися**. Якби список міг бути ключем і ти змінив би його після вставки, хеш став би іншим — і словник шукав би його не в тій комірці. Тому \`list\`, \`dict\`, \`set\` — «unhashable».`,
    },
    {
      type: "flow",
      title: "Пошук d[key] у хеш-таблиці",
      nodes: [
        { id: "s", kind: "start", label: "d[key]", col: 0, row: 0 },
        { id: "h", kind: "process", label: "i = hash(key) % 8", col: 0, row: 1 },
        { id: "empty", kind: "decision", label: "слот i порожній?", col: 0, row: 2 },
        { id: "err", kind: "end", label: "KeyError", col: 1, row: 2 },
        { id: "eq", kind: "decision", label: "ключ у слоті\n== key ?", col: 0, row: 3 },
        { id: "ret", kind: "end", label: "return значення", col: 1, row: 3 },
        { id: "next", kind: "process", label: "i = (i + 1) % 8", col: 0, row: 4 },
      ],
      edges: [
        { from: "s", to: "h" },
        { from: "h", to: "empty" },
        { from: "empty", to: "err", label: "так" },
        { from: "empty", to: "eq", label: "ні" },
        { from: "eq", to: "ret", label: "так" },
        { from: "eq", to: "next", label: "ні" },
        { from: "next", to: "empty", side: "left" },
      ],
      scenarios: [
        {
          name: "d[3] — одразу",
          steps: [
            { node: "s", note: "`d = {3: 'Gojo', 11: 'Yuji'}`: 3 лежить у слоті 3, 11 — у слоті 4 (колізія)" },
            { node: "h", note: "`hash(3) = 3`, `3 % 8 = 3`" },
            { node: "empty", note: "слот 3 зайнятий" },
            { node: "eq", note: "`3 == 3` → так" },
            { node: "ret", note: "`'Gojo'` — одна перевірка" },
          ],
        },
        {
          name: "d[11] — колізія",
          steps: [
            { node: "s", note: "`d = {3: 'Gojo', 11: 'Yuji'}`" },
            { node: "h", note: "`hash(11) = 11`, `11 % 8 = 3`" },
            { node: "empty", note: "слот 3 зайнятий" },
            { node: "eq", note: "там ключ `3`, `3 == 11` → ні" },
            { node: "next", note: "`i = 4`" },
            { node: "empty", note: "слот 4 зайнятий" },
            { node: "eq", note: "`11 == 11` → так" },
            { node: "ret", note: "`'Yuji'` — дві перевірки" },
          ],
        },
        {
          name: "d[5] — немає",
          steps: [
            { node: "s", note: "`d = {3: 'Gojo', 11: 'Yuji'}`" },
            { node: "h", note: "`hash(5) = 5`, `5 % 8 = 5`" },
            { node: "empty", note: "слот 5 порожній — такого ключа точно немає" },
            { node: "err", note: "`KeyError: 5`" },
          ],
        },
      ],
      caption: "Спрощена модель: таблиця на 8 слотів і пошук «наступного слота» через `+1`. Справжній CPython обирає наступний слот хитріше (з «перемішуванням» бітів хешу), але ідея та сама: пошук починається одразу з потрібного місця, а не з початку.",
    },
    {
      type: "viz",
      id: "hash-domain-3d",
      title: "Розширення території: хеш-таблиця в 3D",
      caption: `Додавай ключі і дивись, як кожен летить у свою комірку за формулою \`hash % size\`. Червоний спалах — колізія, ключ шукає наступну вільну комірку. Коли заповнено понад 2/3, таблиця **розширюється** і ключі перерозкладаються. Хеш тут навчальний (сума кодів літер), справжній \`hash()\` складніший.`,
    },
    {
      type: "code",
      title: "hashing.py",
      code: `print(hash(42))          # хеш цілого числа — воно саме
print(hash(True))        # True == 1
print(hash((1, 2)) == hash((1, 2)))   # рівні об'єкти — рівні хеші

for key in ["Gojo", 7, (1, 2), [1, 2]]:
    try:
        hash(key)
        print(type(key).__name__, "— можна бути ключем")
    except TypeError:
        print(type(key).__name__, "— unhashable!")`,
      output: `42
1
True
str — можна бути ключем
int — можна бути ключем
tuple — можна бути ключем
list — unhashable!`,
    },
    {
      type: "tip",
      title: "True і 1 — один ключ",
      md: `Ключі порівнюються через \`==\` і хеш. Оскільки \`1 == 1.0 == True\` і їхні хеші рівні, \`{1: "a", True: "b", 1.0: "c"}\` дасть \`{1: 'c'}\` — один ключ, останнє значення. Не змішуй числа і bool у ключах одного словника.`,
    },
    {
      type: "viz",
      id: "lookup-race",
      title: "Перегони пошуку: list проти set/dict",
      caption: `Список перевіряє елементи **по черзі** (O(n)), а множина і словник одразу обчислюють комірку (O(1)). Збільшуй розмір колекції повзунком і запускай пошук — різниця росте разом з n.`,
    },
    {
      type: "quiz",
      question: "Чому `{[1, 2]: \"a\"}` кидає TypeError?",
      options: [
        "Бо ключ не може бути колекцією",
        "Бо список змінюваний і не має хешу",
        "Бо в ключі не можна писати числа",
        "Бо треба писати dict(), а не {}",
      ],
      answer: 1,
      explain: "Список може змінитися, тож його хеш був би ненадійним — Python забороняє `hash(list)`. Кортеж `(1, 2)` — теж колекція, але незмінна, і ключем бути може.",
    },
    {
      type: "joke",
      hero: "Мегумі Фушіґуро",
      md: `Ґоджьо-сенсей пояснив колізії так: «Двоє проклять хочуть в одну комірку? Один відлітає в наступну». Я не впевнений, що це про хеш-таблиці.`,
    },

    // ───────────────────────── 6. Вкладені
    { type: "heading", text: "Вкладені словники і dict comprehension" },
    {
      type: "text",
      md: `Словники можна вкладати: це основа формату JSON і більшості даних з інтернету. Доступ — ланцюжком ключів: \`school["tokyo"]["teacher"]\`. А **dict comprehension** будує словник одним виразом: \`{k: v for ... in ...}\`.`,
    },
    {
      type: "code",
      title: "nested.py",
      code: `school = {
    "tokyo": {"teacher": "Gojo", "students": ["Yuji", "Megumi", "Nobara"]},
    "kyoto": {"teacher": "Utahime", "students": ["Todo", "Mai"]},
}

print(school["tokyo"]["teacher"])
print(len(school["kyoto"]["students"]))
school["tokyo"]["students"].append("Yuta")
print(school["tokyo"]["students"])

# безпечний ланцюжок: get з порожнім словником за замовчуванням
print(school.get("osaka", {}).get("teacher", "—"))`,
      output: `Gojo
2
['Yuji', 'Megumi', 'Nobara', 'Yuta']
—`,
    },
    {
      type: "code",
      title: "dict_comprehension.py",
      code: `names = ["Yuji", "Megumi", "Nobara"]
lengths = {n: len(n) for n in names}
print(lengths)

squares = {x: x * x for x in range(1, 6) if x % 2}
print(squares)

grades = {"Yuji": 1, "Maki": 4}
inverted = {v: k for k, v in grades.items()}   # поміняти ключі й значення
print(inverted)`,
      output: `{'Yuji': 4, 'Megumi': 6, 'Nobara': 6}
{1: 1, 3: 9, 5: 25}
{1: 'Yuji', 4: 'Maki'}`,
    },

    // ───────────────────────── 7. Множини
    { type: "heading", text: "Множини: тільки унікальні" },
    {
      type: "text",
      md: `**Множина** (\`set\`) — це як словник без значень: лише унікальні хешовані ключі. Дублікатів у ній не буває в принципі — спроба додати наявний елемент просто нічого не робить. Як Нескінченність Ґоджьо: те, що вже є, до нього не доторкнеться вдруге.

- порядку **немає** — не розраховуй на нього і не звертайся за індексом;
- перевірка \`x in s\` — O(1), як у словнику;
- \`add\`, \`remove\` (KeyError, якщо нема), \`discard\` (без помилки), \`pop\` (довільний елемент).`,
    },
    {
      type: "viz",
      id: "infinity-set-3d",
      title: "Нескінченність: дублікат не пройде",
      caption: `Кидай елементи в множину. Новий елемент проходить крізь бар'єр і займає орбіту, а дублікат **відбивається** — \`len\` не змінюється. Клацни на кулю на орбіті, щоб виконати \`discard\`.`,
    },
    {
      type: "code",
      title: "sets.py",
      code: `techniques = {"Blue", "Red", "Blue", "Purple", "Red"}
print(len(techniques))                # дублікати зникли
print(sorted(techniques))             # порядку немає — сортуємо для виводу

techniques.add("Domain")
techniques.add("Blue")                # вже є — нічого не станеться
techniques.discard("Hollow")          # немає — теж без помилки
print(len(techniques), "Red" in techniques)

print({3, 1, 2}, {10, 3, 7})          # порядок у виводі не гарантований
print(type({}), type(set()))          # {} — це СЛОВНИК!`,
      output: `3
['Blue', 'Purple', 'Red']
4 True
{1, 2, 3} {10, 3, 7}
<class 'dict'> <class 'set'>`,
    },
    {
      type: "warning",
      title: "{} — не порожня множина",
      md: `\`s = {}\` створює порожній **словник**. Порожня множина — тільки \`set()\`. І ще: \`set("gojo")\` дасть множину **літер** \`{'g', 'o', 'j'}\`, а не множину з одного слова — для цього пиши \`{"gojo"}\`.`,
    },
    {
      type: "code",
      title: "dedupe.py",
      code: `visits = ["Yuji", "Gojo", "Yuji", "Megumi", "Gojo", "Nobara"]

print(len(set(visits)))              # скільки унікальних
print(sorted(set(visits)))           # унікальні, відсортовані
print(list(dict.fromkeys(visits)))   # унікальні, ЗБЕРІГАЮЧИ порядок`,
      output: `4
['Gojo', 'Megumi', 'Nobara', 'Yuji']
['Yuji', 'Gojo', 'Megumi', 'Nobara']`,
    },
    {
      type: "flow",
      title: "Прибрати дублікати зі збереженням порядку",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "init", kind: "process", label: "seen = set()\nout = []", col: 0, row: 1 },
        { id: "loop", kind: "decision", label: "for x in visits:\nє ще x?", col: 0, row: 2 },
        { id: "print", kind: "io", label: "print(out)", col: 1, row: 2 },
        { id: "e", kind: "end", label: "Кінець", col: 1, row: 3 },
        { id: "in", kind: "decision", label: "x in seen ?", col: 0, row: 3 },
        { id: "add", kind: "process", label: "seen.add(x)", col: 0, row: 4 },
        { id: "app", kind: "process", label: "out.append(x)", col: 0, row: 5 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "loop" },
        { from: "loop", to: "in", label: "так" },
        { from: "loop", to: "print", label: "ні" },
        { from: "print", to: "e" },
        { from: "in", to: "loop", label: "continue", side: "left" },
        { from: "in", to: "add", label: "False" },
        { from: "add", to: "app" },
        { from: "app", to: "loop", side: "left" },
      ],
      scenarios: [
        {
          name: "[\"Yuji\", \"Gojo\", \"Yuji\"]",
          steps: [
            { node: "s" },
            { node: "init", note: "`seen = set()`, `out = []`" },
            { node: "loop", note: "`x = 'Yuji'`" },
            { node: "in", note: "`'Yuji' in seen` → False (O(1))" },
            { node: "add", note: "`seen = {'Yuji'}`" },
            { node: "app", note: "`out = ['Yuji']`" },
            { node: "loop", note: "`x = 'Gojo'`" },
            { node: "in", note: "`'Gojo' in seen` → False" },
            { node: "add", note: "`seen = {'Yuji', 'Gojo'}`" },
            { node: "app", note: "`out = ['Yuji', 'Gojo']`" },
            { node: "loop", note: "`x = 'Yuji'`" },
            { node: "in", note: "`'Yuji' in seen` → True — дублікат, пропускаємо" },
            { node: "loop", note: "елементи закінчились" },
            { node: "print", note: "вивід: `['Yuji', 'Gojo']`" },
            { node: "e" },
          ],
        },
      ],
      caption: "Множина `seen` відповідає на «я це вже бачив?» за O(1), а список `out` зберігає порядок першої появи. Саме так під капотом працює і трюк `list(dict.fromkeys(xs))`.",
    },
    {
      type: "tip",
      title: "Прибрати дублікати і зберегти порядок",
      md: `\`list(set(xs))\` прибирає дублікати, але **губить порядок**. Трюк \`list(dict.fromkeys(xs))\` робить те саме і зберігає порядок першої появи — бо словники пам'ятають порядок вставки.`,
    },
    {
      type: "tip",
      title: "Швидкий in для великих даних",
      md: `Якщо багато разів перевіряєш \`if x in big_list\`, один раз зроби \`big_set = set(big_list)\`. Для 100 000 елементів різниця — у тисячі разів: список перебирає всіх, множина одразу стрибає в потрібну комірку.`,
    },

    // ───────────────────────── 8. Операції над множинами
    { type: "heading", text: "Операції над множинами" },
    {
      type: "text",
      md: `Множини вміють те, що ти пам'ятаєш з математики — і роблять це дуже швидко:

- \`a | b\` — **об'єднання**: усі, хто є хоча б в одній;
- \`a & b\` — **перетин**: ті, хто є в обох;
- \`a - b\` — **різниця**: є в \`a\`, але нема в \`b\`;
- \`a ^ b\` — **симетрична різниця**: є рівно в одній з двох;
- \`a <= b\` — чи \`a\` підмножина \`b\`; \`a.isdisjoint(b)\` — чи немає спільних.`,
    },
    {
      type: "viz",
      id: "venn-sets",
      title: "Діаграма Венна: Токіо vs Кіото",
      caption: `Перемикай операцію і дивись, яка область підсвічується і які імена потрапляють у результат. Клацни на ім'я, щоб перенести його між множинами.`,
    },
    {
      type: "code",
      title: "set_ops.py",
      code: `tokyo = {"Yuji", "Megumi", "Nobara", "Maki", "Panda"}
exchange = {"Todo", "Mai", "Maki", "Panda", "Momo"}

print(sorted(tokyo | exchange))   # об'єднання
print(sorted(tokyo & exchange))   # перетин
print(sorted(tokyo - exchange))   # різниця
print(sorted(tokyo ^ exchange))   # симетрична різниця

print({"Yuji", "Maki"} <= tokyo)  # підмножина?
print(tokyo.isdisjoint({"Sukuna"}))`,
      output: `['Mai', 'Maki', 'Megumi', 'Momo', 'Nobara', 'Panda', 'Todo', 'Yuji']
['Maki', 'Panda']
['Megumi', 'Nobara', 'Yuji']
['Mai', 'Megumi', 'Momo', 'Nobara', 'Todo', 'Yuji']
True
True`,
    },
    {
      type: "code",
      title: "frozenset.py",
      code: `# frozenset — незмінна множина, тому може бути ключем
duo = frozenset({"Gojo", "Geto"})
bonds = {duo: "найкращі друзі"}
print(bonds[frozenset({"Geto", "Gojo"})])   # порядок не важливий

# методи-аналоги операторів приймають будь-який iterable
s = {1, 2}
s.update([2, 3, 4])            # як |=, але з будь-якої колекції
print(s, s.intersection(range(3, 10)))`,
      output: `найкращі друзі
{1, 2, 3, 4} {3, 4}`,
    },
    {
      type: "quiz",
      question: "Що буде в `{1, 2, 3} ^ {3, 4}`?",
      options: ["{3}", "{1, 2, 3, 4}", "{1, 2, 4}", "{1, 2}"],
      answer: 2,
      explain: "`^` — симетрична різниця: елементи, що є **рівно в одній** з множин. `3` є в обох, тож випадає: `{1, 2, 4}`.",
    },
    {
      type: "joke",
      md: `Мій Domain Expansion — це \`everyone & {"Gojo"}\`. Перетин усіх зі мною. Результат завжди один: я виграв.`,
    },

    // ───────────────────────── 9. Шпаргалка
    { type: "heading", text: "Шпаргалка: list, tuple, dict, set" },
    {
      type: "text",
      md: `Як обрати колекцію за 5 секунд:

- потрібен **порядок і дублікати**, змінювати — \`list\`;
- фіксований **запис**, ключ словника — \`tuple\`;
- **знайти за назвою**, зв'язати одне з іншим — \`dict\`;
- **унікальність** і швидке \`in\`, операції «спільне / різне» — \`set\`.`,
    },
    {
      type: "table",
      head: ["Операція", "dict", "set", "Складність"],
      rows: [
        ["Створити", "`{}`, `dict(a=1)`, `dict(zip(k, v))`", "`set()`, `{1, 2}`, `set(xs)`", "O(n)"],
        ["Перевірити", "`k in d`", "`x in s`", "O(1)"],
        ["Прочитати", "`d[k]`, `d.get(k, default)`", "— (немає індексів)", "O(1)"],
        ["Додати / змінити", "`d[k] = v`, `d.setdefault(k, v)`", "`s.add(x)`", "O(1)"],
        ["Злити", "`d.update(o)`, `d | o`", "`s.update(o)`, `s | o`", "O(len(o))"],
        ["Видалити", "`del d[k]`, `d.pop(k, None)`", "`s.remove(x)`, `s.discard(x)`", "O(1)"],
        ["Обхід", "`d.keys()`, `d.values()`, `d.items()`", "`for x in s`", "O(n)"],
        ["Операції множин", "`d.keys() & other`", "`| & - ^ <=`", "O(len)"],
        ["Ключ / елемент", "тільки хешовані (str, int, tuple, frozenset)", "те саме", "—"],
      ],
    },
    {
      type: "quiz",
      question: "Потрібно зберігати, скільки разів кожен студент відвідав заняття. Що обрати?",
      options: ["list імен", "set імен", "dict ім'я → кількість", "tuple пар"],
      answer: 2,
      explain: "Треба **зв'язати** ім'я з числом і швидко оновлювати його — це словник (або `Counter`, який теж словник). Множина втратить кількість, а список змусить шукати по черзі.",
    },
    {
      type: "joke",
      md: `Не хвилюйся, ти вивчив словники. Ти — найсильніший. Ну, другий після мене. \`rank.get("you", 2)\`.`,
    },
  ]
};

export default section;
