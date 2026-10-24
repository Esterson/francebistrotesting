/* Temporary designed menu sheets. Replace with approved restaurant files before launch. */
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../assets');await mkdir(root,{recursive:true});
const menus={
  "ru": {
    "kitchen": [
      [
        "Закуски",
        [
          [
            "Тартар из говядины",
            "Каперсы, корнишоны, горчичный соус",
            "890"
          ],
          [
            "Паштет из утиной печени",
            "Бриошь, сезонный конфитюр",
            "650"
          ],
          [
            "Буррата с томатами",
            "Базилик, оливковое масло",
            "790"
          ],
          [
            "Зелёный салат",
            "Листья салата, авокадо, цитрусовая заправка",
            "590"
          ],
          [
            "Луковый суп",
            "Грюйер, домашний хлеб",
            "690"
          ]
        ]
      ],
      [
        "Горячее",
        [
          [
            "Утиная ножка конфи",
            "Картофельное пюре, вишнёвый соус",
            "1 290"
          ],
          [
            "Говядина по-бургундски",
            "Корнеплоды, красное вино",
            "1 390"
          ],
          [
            "Морской сибас",
            "Сезонные овощи, соус бер-блан",
            "1 490"
          ],
          [
            "Ризотто с грибами",
            "Пармезан, трюфельное масло",
            "990"
          ],
          [
            "Картофельный гратен",
            "Сливки, тимьян, грюйер",
            "450"
          ]
        ]
      ],
      [
        "Сладкий финал",
        [
          [
            "Крем-брюле",
            "Ваниль, хрустящая карамель",
            "490"
          ],
          [
            "Тарт Татен",
            "Яблоки, ванильное мороженое",
            "590"
          ],
          [
            "Шоколадный фондан",
            "Тёмный шоколад, ягоды",
            "590"
          ],
          [
            "Лимонный тарт",
            "Меренга, лимонный крем",
            "490"
          ],
          [
            "Сырная тарелка",
            "Ассорти сыров, мёд, орехи",
            "1 190"
          ]
        ]
      ]
    ],
    "bar": [
      [
        "Аперитивы",
        [
          [
            "Kir Royal",
            "Крем де кассис, игристое вино · 150 мл",
            "690"
          ],
          [
            "French 75",
            "Джин, лимон, игристое вино · 150 мл",
            "750"
          ],
          [
            "Negroni",
            "Джин, красный вермут, биттер · 90 мл",
            "690"
          ],
          [
            "Lillet Tonic",
            "Лилле, тоник, огурец · 200 мл",
            "650"
          ],
          [
            "Kir",
            "Белое вино, крем де кассис · 150 мл",
            "590"
          ]
        ]
      ],
      [
        "Вино по бокалам",
        [
          [
            "Crémant de Loire",
            "Франция · Брют · 125 мл",
            "790"
          ],
          [
            "Sauvignon Blanc",
            "Франция · Белое сухое · 125 мл",
            "690"
          ],
          [
            "Chardonnay",
            "Франция · Белое сухое · 125 мл",
            "750"
          ],
          [
            "Pinot Noir",
            "Франция · Красное сухое · 125 мл",
            "790"
          ],
          [
            "Côtes du Rhône",
            "Франция · Красное сухое · 125 мл",
            "690"
          ]
        ]
      ],
      [
        "Без спешки",
        [
          [
            "Эспрессо",
            "Ароматный и насыщенный · 30 мл",
            "190"
          ],
          [
            "Капучино",
            "Эспрессо, молочная пена · 180 мл",
            "290"
          ],
          [
            "Чай листовой",
            "Чёрный / зелёный / травяной · 500 мл",
            "390"
          ],
          [
            "Домашний лимонад",
            "Сезонные фрукты и травы · 300 мл",
            "390"
          ],
          [
            "Минеральная вода",
            "С газом / без газа · 500 мл",
            "350"
          ]
        ]
      ]
    ]
  },
  "en": {
    "kitchen": [
      [
        "Starters",
        [
          [
            "Beef tartare",
            "Capers, cornichons, mustard dressing",
            "890"
          ],
          [
            "Duck liver pâté",
            "Brioche, seasonal fruit preserve",
            "650"
          ],
          [
            "Burrata with tomatoes",
            "Basil, olive oil",
            "790"
          ],
          [
            "Green salad",
            "Mixed leaves, avocado, citrus dressing",
            "590"
          ],
          [
            "French onion soup",
            "Gruyère, homemade bread",
            "690"
          ]
        ]
      ],
      [
        "Main courses",
        [
          [
            "Duck leg confit",
            "Mashed potatoes, cherry sauce",
            "1 290"
          ],
          [
            "Beef bourguignon",
            "Root vegetables, red wine",
            "1 390"
          ],
          [
            "Sea bass",
            "Seasonal vegetables, beurre blanc",
            "1 490"
          ],
          [
            "Mushroom risotto",
            "Parmesan, truffle oil",
            "990"
          ],
          [
            "Potato gratin",
            "Cream, thyme, Gruyère",
            "450"
          ]
        ]
      ],
      [
        "A sweet finish",
        [
          [
            "Crème brûlée",
            "Vanilla, crisp caramel",
            "490"
          ],
          [
            "Tarte Tatin",
            "Apples, vanilla ice cream",
            "590"
          ],
          [
            "Chocolate fondant",
            "Dark chocolate, berries",
            "590"
          ],
          [
            "Lemon tart",
            "Meringue, lemon cream",
            "490"
          ],
          [
            "Cheese selection",
            "Assorted cheeses, honey, nuts",
            "1 190"
          ]
        ]
      ]
    ],
    "bar": [
      [
        "Aperitifs",
        [
          [
            "Kir Royal",
            "Crème de cassis, sparkling wine · 150 ml",
            "690"
          ],
          [
            "French 75",
            "Gin, lemon, sparkling wine · 150 ml",
            "750"
          ],
          [
            "Negroni",
            "Gin, red vermouth, bitters · 90 ml",
            "690"
          ],
          [
            "Lillet Tonic",
            "Lillet, tonic, cucumber · 200 ml",
            "650"
          ],
          [
            "Kir",
            "White wine, crème de cassis · 150 ml",
            "590"
          ]
        ]
      ],
      [
        "Wines by the glass",
        [
          [
            "Crémant de Loire",
            "France · Brut · 125 ml",
            "790"
          ],
          [
            "Sauvignon Blanc",
            "France · Dry white · 125 ml",
            "690"
          ],
          [
            "Chardonnay",
            "France · Dry white · 125 ml",
            "750"
          ],
          [
            "Pinot Noir",
            "France · Dry red · 125 ml",
            "790"
          ],
          [
            "Côtes du Rhône",
            "France · Dry red · 125 ml",
            "690"
          ]
        ]
      ],
      [
        "Take your time",
        [
          [
            "Espresso",
            "Rich and aromatic · 30 ml",
            "190"
          ],
          [
            "Cappuccino",
            "Espresso, milk foam · 180 ml",
            "290"
          ],
          [
            "Loose-leaf tea",
            "Black / green / herbal · 500 ml",
            "390"
          ],
          [
            "Homemade lemonade",
            "Seasonal fruit and herbs · 300 ml",
            "390"
          ],
          [
            "Mineral water",
            "Still or sparkling · 500 ml",
            "350"
          ]
        ]
      ]
    ]
  }
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const [lang,tabs]of Object.entries(menus))for(const[tab,pages]of Object.entries(tabs))for(const[page,[title,items]]of pages.entries()){
const text=items.map(([name,desc,price],i)=>{const y=350+i*100;return `<text x="70" y="${y}" font-size="24">${esc(name)}</text><text x="70" y="${y+28}" font-size="13" fill="#766b61">${esc(desc)}</text><text x="650" y="${y}" text-anchor="end" font-family="Arial" font-size="18">${price}</text>`}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1000" viewBox="0 0 720 1000"><rect width="720" height="1000" fill="#fbf6ed"/><rect x="25" y="25" width="670" height="950" fill="none" stroke="#58212d" stroke-width=".7"/><g fill="#58212d" font-family="Georgia,serif"><text x="360" y="110" font-size="53" letter-spacing="7" text-anchor="middle">chevalet</text><text x="360" y="148" font-size="11" letter-spacing="4" text-anchor="middle">COCKTAIL BISTRO</text><path d="M315 194H405M360 184V204" stroke="#58212d" stroke-width=".7"/><text x="360" y="265" text-anchor="middle" font-style="italic" font-size="42">${title}</text>${text}<path d="M70 864H650" stroke="#58212d" stroke-width=".5"/><text x="360" y="901" text-anchor="middle" font-size="13" font-style="italic">${lang==='ru'?'В удовольствие. С любовью.':'For the pleasure of it.'}</text><text x="360" y="934" text-anchor="middle" font-family="Arial" font-size="9" fill="#766b61">${lang==='ru'?'ДЕМОНСТРАЦИОННАЯ КАРТА · БЛЮДА И ЦЕНЫ ДЛЯ ПРЕЗЕНТАЦИИ · ₽':'SAMPLE MENU · DISHES AND PRICES FOR PRESENTATION · RUB'}</text><text x="650" y="958" text-anchor="end" font-size="11">0${page+1}</text></g></svg>`;
await writeFile(resolve(root,`menu-${lang}-${tab}-${page+1}.svg`),svg);
}
console.log('Created 12 bilingual demonstration menu sheets.');
