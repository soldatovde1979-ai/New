/* MASHIKA — список работ. Версия 1.0, схема данных: 1
 *
 * Чтобы добавить картину — допишите объект в items. Поля:
 *   title     — название
 *   year      — год
 *   technique — техника, например «холст, акрил»
 *   w, h      — размер в сантиметрах (ширина, высота); задаёт пропорции карточки
 *   price     — число в рублях или null («цена по запросу»)
 *   status    — 'available' | 'reserved' | 'sold'
 *   image     — путь к фото, например 'img/teply-shum.jpg'; null — рисуется заглушка
 *   seed      — номер узора заглушки (любое число; не нужен, если есть image)
 *   palette   — цвета заглушки (не нужны, если есть image)
 *
 * ⚠️ Все работы ниже — заглушки с выдуманными названиями.
 */
window.MASHIKA_WORKS = {
  schema: 1,
  items: [
    { title: 'Тёплый шум',      year: 2025, technique: 'холст, акрил',          w: 60,  h: 80,  price: null, status: 'available', image: null, seed: 11, palette: ['#f3e6d0', '#e3a33a', '#d2453f', '#2b3f9e', '#1d1a19'] },
    { title: 'Соль и охра',     year: 2025, technique: 'холст, масло',          w: 80,  h: 80,  price: null, status: 'available', image: null, seed: 23, palette: ['#ece4d6', '#c9862b', '#8f3b22', '#e9c46a', '#3a3530'] },
    { title: 'Ночной сад',      year: 2024, technique: 'холст, акрил',          w: 70,  h: 100, price: null, status: 'reserved',  image: null, seed: 5,  palette: ['#14202b', '#1f9e8f', '#7bd3c0', '#e86a92', '#f2e8d5'] },
    { title: 'Перед грозой',    year: 2024, technique: 'холст, смешанная техника', w: 100, h: 70, price: null, status: 'available', image: null, seed: 42, palette: ['#d9d6cf', '#4a5568', '#2b3f9e', '#e3a33a', '#111'] },
    { title: 'Голубая пауза',   year: 2025, technique: 'холст, акрил',          w: 50,  h: 70,  price: null, status: 'available', image: null, seed: 77, palette: ['#eaf0f4', '#6fa8dc', '#2b3f9e', '#f4b6c2', '#ffffff'] },
    { title: 'Ритм города',     year: 2023, technique: 'холст, масло',          w: 90,  h: 60,  price: null, status: 'sold',      image: null, seed: 31, palette: ['#f2ede4', '#d2453f', '#1d1a19', '#e3a33a', '#3c6e71'] },
    { title: 'Шёпот',           year: 2025, technique: 'бумага, гуашь',         w: 40,  h: 50,  price: null, status: 'available', image: null, seed: 64, palette: ['#f5efe6', '#d8b4a0', '#a3b18a', '#6b705c', '#e9d8a6'] },
    { title: 'Красная нить',    year: 2024, technique: 'холст, акрил',          w: 60,  h: 90,  price: null, status: 'available', image: null, seed: 18, palette: ['#1a1414', '#b5222d', '#f07167', '#f2e8d5', '#e3a33a'] },
    { title: 'Утро в августе',  year: 2025, technique: 'холст, масло',          w: 80,  h: 60,  price: null, status: 'available', image: null, seed: 93, palette: ['#fff4e0', '#f6bd60', '#f28482', '#84a59d', '#f7ede2'] }
  ]
};
